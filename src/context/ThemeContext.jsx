'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { defaultTheme, themePresets } from '../data/initialData';
import { loadThemeSettings, saveThemeSettings } from '../services/storageService';
import { applyThemeToDOM } from '../utils/colorUtils';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ synced: true, message: "Ready" });

  // Initial load
  useEffect(() => {
    const initTheme = async () => {
      try {
        const loaded = await loadThemeSettings();
        setTheme(loaded);
        applyThemeToDOM(loaded.primaryColor, loaded.secondaryColor);
      } catch (err) {
        console.error("Theme load error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initTheme();
  }, []);

  // Update theme and apply to DOM immediately
  const updateTheme = async (updates) => {
    setIsSaving(true);
    const updatedTheme = { ...theme, ...updates };
    setTheme(updatedTheme);

    // Apply colors immediately to DOM
    if (updates.primaryColor || updates.secondaryColor) {
      applyThemeToDOM(
        updates.primaryColor || theme.primaryColor,
        updates.secondaryColor || theme.secondaryColor
      );
    }

    try {
      const res = await saveThemeSettings(updatedTheme);
      setSyncStatus({
        synced: res.syncedToCloud,
        message: res.syncedToCloud ? "Synced with Firebase Firestore" : "Saved locally (Offline/Protected mode)"
      });
    } catch (err) {
      setSyncStatus({ synced: false, message: "Failed to persist to cloud" });
    } finally {
      setIsSaving(false);
    }
  };

  // 1-Click preset applicator
  const applyPreset = async (presetId) => {
    const preset = themePresets.find(p => p.id === presetId);
    if (!preset) return;
    await updateTheme({
      primaryColor: preset.primary,
      secondaryColor: preset.secondary
    });
  };

  // Reset to default
  const resetTheme = async () => {
    await updateTheme(defaultTheme);
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      isLoading,
      isSaving,
      syncStatus,
      updateTheme,
      applyPreset,
      resetTheme,
      presets: themePresets
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
