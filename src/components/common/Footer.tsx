import React from 'react';
import { Heart } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  return (
    <footer className="w-full py-8 mt-16 border-t border-white/50 dark:border-white/10 text-center text-xs text-stone-500 dark:text-stone-400 bg-white/30 dark:bg-stone-900/30 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center justify-center space-y-2">
        <div className="flex items-center space-x-1.5 text-stone-700 dark:text-stone-300 font-medium">
          <span>Made with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
          <span>especially for Martha</span>
        </div>
        <p className="text-stone-400 dark:text-stone-500 text-[11px]">
          {settings.siteTitle || 'For Martha'} • A private digital memory space & scrapbook
        </p>
      </div>
    </footer>
  );
};
