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
    bgGradient: 'bg-gradient-to-b from-[#18131d] via-[#14111a] to-[#0e0c14]',
    cardBg: 'bg-[#1e1927]/60 backdrop-blur-2xl border border-amber-500/20 shadow-2xl shadow-amber-950/30 text-stone-100',
    accentBg: 'bg-gradient-to-r from-amber-500 to-amber-600',
    accentHover: 'hover:from-amber-600 hover:to-amber-700',
    accentText: 'text-amber-300',
    accentBorder: 'border-amber-400/40',
    badgeBg: 'bg-amber-500/20 text-amber-300 border border-amber-400/30 backdrop-blur-md',
    glowEffect: 'shadow-amber-500/25',
  },
  'rose-gold': {
    name: 'Rose Gold & Blush',
    bgGradient: 'bg-gradient-to-b from-[#1c111a] via-[#160e15] to-[#0f090e]',
    cardBg: 'bg-[#251522]/60 backdrop-blur-2xl border border-rose-500/20 shadow-2xl shadow-rose-950/30 text-stone-100',
    accentBg: 'bg-gradient-to-r from-rose-500 to-pink-600',
    accentHover: 'hover:from-rose-600 hover:to-pink-700',
    accentText: 'text-rose-300',
    accentBorder: 'border-rose-400/40',
    badgeBg: 'bg-rose-500/20 text-rose-300 border border-rose-400/30 backdrop-blur-md',
    glowEffect: 'shadow-rose-500/25',
  },
  'soft-peach': {
    name: 'Soft Peach & Honey',
    bgGradient: 'bg-gradient-to-b from-[#1c1314] via-[#161011] to-[#0f0b0c]',
    cardBg: 'bg-[#261719]/60 backdrop-blur-2xl border border-orange-500/20 shadow-2xl shadow-orange-950/30 text-stone-100',
    accentBg: 'bg-gradient-to-r from-orange-500 to-amber-500',
    accentHover: 'hover:from-orange-600 hover:to-amber-600',
    accentText: 'text-orange-300',
    accentBorder: 'border-orange-400/40',
    badgeBg: 'bg-orange-500/20 text-orange-300 border border-orange-400/30 backdrop-blur-md',
    glowEffect: 'shadow-orange-500/25',
  },
  'lavender': {
    name: 'Lavender Mist & Lilac',
    bgGradient: 'bg-gradient-to-b from-[#171124] via-[#120e1d] to-[#0b0813]',
    cardBg: 'bg-[#201533]/60 backdrop-blur-2xl border border-purple-500/20 shadow-2xl shadow-purple-950/30 text-stone-100',
    accentBg: 'bg-gradient-to-r from-purple-500 to-indigo-500',
    accentHover: 'hover:from-purple-600 hover:to-indigo-600',
    accentText: 'text-purple-300',
    accentBorder: 'border-purple-400/40',
    badgeBg: 'bg-purple-500/20 text-purple-300 border border-purple-400/30 backdrop-blur-md',
    glowEffect: 'shadow-purple-500/25',
  },
  'sage-green': {
    name: 'Sage Green & Meadow',
    bgGradient: 'bg-gradient-to-b from-[#0f1915] via-[#0c1411] to-[#070d0b]',
    cardBg: 'bg-[#14261f]/60 backdrop-blur-2xl border border-emerald-500/20 shadow-2xl shadow-emerald-950/30 text-stone-100',
    accentBg: 'bg-gradient-to-r from-emerald-500 to-teal-600',
    accentHover: 'hover:from-emerald-600 hover:to-teal-700',
    accentText: 'text-emerald-300',
    accentBorder: 'border-emerald-400/40',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-md',
    glowEffect: 'shadow-emerald-500/25',
  },
  'starry-dusk': {
    name: 'Starry Dusk & Navy',
    bgGradient: 'bg-gradient-to-b from-[#0e1324] via-[#0a0e1b] to-[#060812]',
    cardBg: 'bg-[#151c33]/60 backdrop-blur-2xl border border-indigo-500/20 shadow-2xl shadow-indigo-950/40 text-stone-100',
    accentBg: 'bg-gradient-to-r from-indigo-500 to-blue-600',
    accentHover: 'hover:from-indigo-600 hover:to-blue-700',
    accentText: 'text-indigo-300',
    accentBorder: 'border-indigo-400/40',
    badgeBg: 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 backdrop-blur-md',
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
