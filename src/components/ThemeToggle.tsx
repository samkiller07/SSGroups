'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme-context';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

interface ThemeToggleProps {
  brandId?: string;
  variant?: 'compact' | 'dropdown' | 'pill';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ brandId, variant = 'compact', className = '' }) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-8 h-8 rounded-xl bg-slate-800/40 animate-pulse ${className}`} />
    );
  }

  // Brand-aware accent border & button style
  const getBrandBtnStyle = () => {
    switch (brandId) {
      case 'aquarium':
        return 'hover:border-cyan-500/60 hover:text-cyan-300 focus:ring-cyan-500/30';
      case 'kirubai':
        return 'hover:border-orange-500/60 hover:text-amber-300 focus:ring-amber-500/30';
      case 'vision-360':
        return 'hover:border-blue-500/60 hover:text-blue-300 focus:ring-blue-500/30';
      default:
        return 'hover:border-slate-500 hover:text-white focus:ring-slate-500/30';
    }
  };

  if (variant === 'pill') {
    return (
      <div className={`inline-flex items-center p-1 rounded-full border bg-slate-900/60 dark:bg-slate-950/80 border-slate-700/60 dark:border-slate-800 text-xs ${className}`}>
        <button
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-bold transition-all ${
            theme === 'light'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Light mode"
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Light</span>
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-bold transition-all ${
            theme === 'dark'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Dark mode"
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Dark</span>
        </button>
        <button
          onClick={() => setTheme('system')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-bold transition-all ${
            theme === 'system'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="System theme"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Auto</span>
        </button>
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative inline-block ${className}`}>
        <button
          onClick={() => setOpen(!open)}
          className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all bg-slate-900/80 dark:bg-slate-950/90 border-slate-750 dark:border-slate-800 text-slate-300 ${getBrandBtnStyle()}`}
          aria-label="Toggle theme menu"
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="w-4 h-4 text-cyan-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
          <span className="capitalize">{theme}</span>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 mt-1.5 w-36 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-1.5 z-50 space-y-0.5 text-xs">
              <button
                onClick={() => {
                  setTheme('light');
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                  theme === 'light' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Mode</span>
                </div>
                {theme === 'light' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => {
                  setTheme('dark');
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                  theme === 'dark' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Moon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Dark Mode</span>
                </div>
                {theme === 'dark' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => {
                  setTheme('system');
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                  theme === 'system' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Monitor className="w-3.5 h-3.5" />
                  <span>System Auto</span>
                </div>
                {theme === 'system' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Default compact toggle icon button
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-xl border transition-all flex items-center justify-center bg-slate-900/80 dark:bg-slate-950/80 border-slate-700/60 dark:border-slate-800 text-slate-300 hover:scale-105 active:scale-95 ${getBrandBtnStyle()} ${className}`}
      title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-300 hover:rotate-45 transition-transform" />
      ) : (
        <Moon className="w-4 h-4 text-cyan-600 dark:text-cyan-400 hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
};
