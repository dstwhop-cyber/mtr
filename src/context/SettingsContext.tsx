import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings, ThemePreset, ParticleAnimationType } from '../types';
import { DEFAULT_SETTINGS } from '../data/initialData';
import { DataService } from '../services/dataService';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  isLoading: boolean;
  themeClasses: {
    bgGradient: string;
    cardBg: string;
    accentBg: string;
    accentHover: string;
    accentText: string;
    accentBorder: string;
    badgeBg: string;
    glowEffect: string;
  };
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const THEME_STYLES: Record<
  ThemePreset,
  {
    name: string;
    bgGradient: string;
    cardBg: string;
    accentBg: string;
    accentHover: string;
    accentText: string;
    accentBorder: string;
    badgeBg: string;
    glowEffect: string;
  }
> = {
  'warm-amber': {
    name: 'Warm Amber & Cream',
    bgGradient: 'bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-stone-50/80',
    cardBg: 'bg-white/65 backdrop-blur-xl border border-white/70 shadow-lg shadow-amber-950/5',
    accentBg: 'bg-amber-600',
    accentHover: 'hover:bg-amber-700',
    accentText: 'text-amber-700',
    accentBorder: 'border-amber-200/80',
    badgeBg: 'bg-amber-100/80 text-amber-900 border border-amber-200/50 backdrop-blur-sm',
    glowEffect: 'shadow-amber-400/25',
  },
  'rose-gold': {
    name: 'Rose Gold & Blush',
    bgGradient: 'bg-gradient-to-b from-rose-50/70 via-pink-50/30 to-stone-50/80',
    cardBg: 'bg-white/65 backdrop-blur-xl border border-white/70 shadow-lg shadow-rose-950/5',
    accentBg: 'bg-rose-500',
    accentHover: 'hover:bg-rose-600',
    accentText: 'text-rose-600',
    accentBorder: 'border-rose-200/80',
    badgeBg: 'bg-rose-100/80 text-rose-900 border border-rose-200/50 backdrop-blur-sm',
    glowEffect: 'shadow-rose-400/25',
  },
  'soft-peach': {
    name: 'Soft Peach & Honey',
    bgGradient: 'bg-gradient-to-b from-orange-50/70 via-amber-50/30 to-stone-50/80',
    cardBg: 'bg-white/65 backdrop-blur-xl border border-white/70 shadow-lg shadow-orange-950/5',
    accentBg: 'bg-orange-500',
    accentHover: 'hover:bg-orange-600',
    accentText: 'text-orange-600',
    accentBorder: 'border-orange-200/80',
    badgeBg: 'bg-orange-100/80 text-orange-900 border border-orange-200/50 backdrop-blur-sm',
    glowEffect: 'shadow-orange-400/25',
  },
  'lavender': {
    name: 'Lavender Mist & Lilac',
    bgGradient: 'bg-gradient-to-b from-purple-50/70 via-indigo-50/30 to-stone-50/80',
    cardBg: 'bg-white/65 backdrop-blur-xl border border-white/70 shadow-lg shadow-purple-950/5',
    accentBg: 'bg-purple-600',
    accentHover: 'hover:bg-purple-700',
    accentText: 'text-purple-600',
    accentBorder: 'border-purple-200/80',
    badgeBg: 'bg-purple-100/80 text-purple-900 border border-purple-200/50 backdrop-blur-sm',
    glowEffect: 'shadow-purple-400/25',
  },
  'sage-green': {
    name: 'Sage Green & Meadow',
    bgGradient: 'bg-gradient-to-b from-emerald-50/60 via-teal-50/30 to-stone-50/80',
    cardBg: 'bg-white/65 backdrop-blur-xl border border-white/70 shadow-lg shadow-emerald-950/5',
    accentBg: 'bg-emerald-600',
    accentHover: 'hover:bg-emerald-700',
    accentText: 'text-emerald-700',
    accentBorder: 'border-emerald-200/80',
    badgeBg: 'bg-emerald-100/80 text-emerald-900 border border-emerald-200/50 backdrop-blur-sm',
    glowEffect: 'shadow-emerald-400/25',
  },
  'starry-dusk': {
    name: 'Starry Dusk & Navy',
    bgGradient: 'bg-gradient-to-b from-slate-950 via-stone-900 to-indigo-950 text-stone-100',
    cardBg: 'bg-stone-900/60 backdrop-blur-xl border border-white/10 shadow-xl shadow-indigo-950/40 text-stone-100',
    accentBg: 'bg-indigo-500',
    accentHover: 'hover:bg-indigo-600',
    accentText: 'text-indigo-300',
    accentBorder: 'border-indigo-500/40',
    badgeBg: 'bg-indigo-900/60 text-indigo-200 border border-indigo-500/30 backdrop-blur-sm',
    glowEffect: 'shadow-indigo-500/30',
  },
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const loaded = await DataService.getSettings();
        setSettings(loaded);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updated = await DataService.saveSettings(newSettings);
      setSettings(updated);
    } catch (err) {
      console.error('Error saving settings:', err);
      throw err;
    }
  };

  const currentTheme = settings.themePreset || 'warm-amber';
  const themeClasses = THEME_STYLES[currentTheme] || THEME_STYLES['warm-amber'];

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        isLoading,
        themeClasses,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
