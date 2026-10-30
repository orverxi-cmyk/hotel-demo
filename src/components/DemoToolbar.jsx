'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../context/ThemeContext';
import { Palette, Shield, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';

export const DemoToolbar = ({ onOpenCMS }) => {
  const { theme, presets, applyPreset } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {isOpen && (
        <div className="mb-3 p-4 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-white/20 shadow-2xl text-white w-72 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Demo Pitcher Toolbar
            </span>
            <span className="text-[10px] text-stone-400">1-Click Client Presets</span>
          </div>

          <div className="space-y-1.5">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                className="w-full p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-between text-left transition-all text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    <span className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ backgroundColor: preset.primary }} />
                    <span className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ backgroundColor: preset.secondary }} />
                  </div>
                  <span className="truncate max-w-[130px] font-medium">{preset.name}</span>
                </div>
                <span className="text-[9px] font-mono text-stone-400 uppercase">{preset.category.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <Link
              href="/admin"
              className="w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center justify-center gap-2 shadow-lg"
              style={{ backgroundColor: 'var(--color-secondary)' }}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Full CMS Admin Panel (/admin)</span>
            </Link>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <div className="flex items-center gap-2 shadow-2xl">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-950/90 hover:bg-slate-950 text-white border border-amber-400/40 shadow-xl backdrop-blur-md text-xs font-semibold transition-all hover:scale-105 active:scale-95 group"
          title="Demo Quick Palette Switcher"
        >
          <div className="flex -space-x-1.5 items-center">
            <span className="w-3 h-3 rounded-full border border-white/40" style={{ backgroundColor: 'var(--color-primary)' }} />
            <span className="w-3 h-3 rounded-full border border-white/40" style={{ backgroundColor: 'var(--color-secondary)' }} />
          </div>
          <span className="hidden sm:inline">Theme Switcher</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-stone-400" /> : <ChevronUp className="w-3.5 h-3.5 text-stone-400" />}
        </button>

        <button
          onClick={onOpenCMS}
          className="p-2.5 rounded-full text-slate-950 shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-secondary)' }}
          title="Open CMS Admin Center"
        >
          <Shield className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

