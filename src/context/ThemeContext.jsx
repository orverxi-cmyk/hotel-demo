'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { defaultTheme, themePresets } from '../data/initialData';
import { loadThemeSettings, saveThemeSettings, getCachedTheme, subscribeThemeSettings } from '../services/storageService';
import { applyThemeToDOM } from '../utils/colorUtils';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(defaultTheme);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ synced: true, message: "Ready" });

  // Initial load with instant cache & real-time sync
  useEffect(() => {
    // 1. Instant 0ms cache application
    const cached = getCachedTheme();
    if (cached) {
      setTheme(cached);
      applyThemeToDOM(cached);
    }

    // 2. Real-time subscription (Firestore onSnapshot + BroadcastChannel + Events)
    const unsubscribe = subscribeThemeSettings((newTheme) => {
      if (newTheme) {
        setTheme(newTheme);
        applyThemeToDOM(newTheme);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update theme and apply to DOM immediately
  const updateTheme = async (updates) => {
    setIsSaving(true);
    const updatedTheme = { ...theme, ...updates };
    setTheme(updatedTheme);

    // Apply colors immediately to DOM
    applyThemeToDOM(updatedTheme);

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
      primaryHoverColor: preset.primaryHover || undefined,
      secondaryColor: preset.secondary,
      secondaryHoverColor: preset.secondaryHover || undefined,
      backgroundColor: preset.backgroundColor || '#fdfbf7',
      surfaceColor: preset.surfaceColor || '#ffffff',
      activeColor: preset.activeColor || preset.secondaryHover || undefined
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
