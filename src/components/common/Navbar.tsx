import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useMusic } from '../../context/MusicContext';
import { Heart, LogOut, Music2, Shield, Menu, X, Image, Film, Calendar, Gift } from 'lucide-react';

interface NavbarProps {
  onNavigateSection?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateSection }) => {
  const { authState, logout, isOwner, isMartha } = useAuth();
  const { settings, themeClasses } = useSettings();
  const { isPlaying, currentSong, togglePlay } = useMusic();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(id);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl border-b border-white/70 dark:border-white/10 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <div
          className="flex items-center space-x-2.5 cursor-pointer group select-none"
          onClick={() => scrollTo('hero')}
        >
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-rose-500 flex items-center gap-1.5">
            For Martha <span className="text-xl inline-block transform group-hover:scale-110 transition-transform">❤️</span>
          </span>
          {isOwner && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-semibold flex items-center gap-1 border border-amber-300/40">
              <Shield className="w-3 h-3" /> Admin Studio
            </span>
          )}
        </div>

        {/* Desktop Navigation for Martha */}
        {isMartha && (
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-stone-600 dark:text-stone-300">
            <button
              onClick={() => scrollTo('photos')}
              className="hover:text-stone-900 dark:hover:text-white transition cursor-pointer py-1"
            >
              Gallery
            </button>
            <button
              onClick={() => scrollTo('videos')}
              className="hover:text-stone-900 dark:hover:text-white transition cursor-pointer py-1"
            >
              Moments
            </button>
            <button
              onClick={() => scrollTo('timeline')}
              className="hover:text-stone-900 dark:hover:text-white transition cursor-pointer py-1"
            >
              Timeline
            </button>
            <button
              onClick={() => scrollTo('surprise')}
              className="text-rose-500 hover:text-rose-600 dark:text-rose-400 font-medium transition cursor-pointer flex items-center gap-1"
            >
              <Gift className="w-3.5 h-3.5" />
              Surprise
            </button>
          </nav>
        )}

        {/* Right Action Area */}
        <div className="flex items-center space-x-3">
          {/* Music Quick Badge */}
          {currentSong && (
            <button
              onClick={togglePlay}
              title={isPlaying ? 'Pause music' : 'Play music'}
              className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isPlaying
                  ? `${themeClasses.badgeBg} shadow-xs`
                  : 'bg-white/60 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 border-white/80 dark:border-stone-700 backdrop-blur-md hover:bg-white/80'
              }`}
            >
              <Music2 className={`w-3.5 h-3.5 ${isPlaying ? 'animate-pulse text-amber-600' : ''}`} />
              <span className="max-w-[110px] truncate">{currentSong.title}</span>
              {isPlaying && (
                <span className="flex space-x-0.5 items-end h-3 ml-1">
                  <span className="w-0.5 h-2 bg-current animate-pulse" style={{ animationDelay: '0.1s' }} />
                  <span className="w-0.5 h-3 bg-current animate-pulse" style={{ animationDelay: '0.3s' }} />
                  <span className="w-0.5 h-1.5 bg-current animate-pulse" style={{ animationDelay: '0.2s' }} />
                </span>
              )}
            </button>
          )}

          {/* Log out Button matching screenshot frosted pill */}
          {authState.isAuthenticated && (
            <button
              onClick={logout}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium text-stone-700 dark:text-stone-200 bg-white/70 dark:bg-stone-800/70 hover:bg-white dark:hover:bg-stone-700 border border-stone-200/80 dark:border-white/15 backdrop-blur-md shadow-xs transition"
              title="Log out"
            >
              <span>Log out</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          {isMartha && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-white/60 dark:hover:bg-stone-800 backdrop-blur-md border border-white/50"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMartha && mobileMenuOpen && (
        <div className="md:hidden bg-white/90 dark:bg-stone-900/90 backdrop-blur-2xl border-b border-white/50 dark:border-stone-800 px-4 py-3 space-y-2">
          <button
            onClick={() => scrollTo('photos')}
            className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-white/60 dark:hover:bg-stone-800 flex items-center gap-2.5 text-sm font-medium text-stone-700 dark:text-stone-200"
          >
            <Image className="w-4 h-4 text-stone-500" />
            Gallery
          </button>
          <button
            onClick={() => scrollTo('videos')}
            className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-white/60 dark:hover:bg-stone-800 flex items-center gap-2.5 text-sm font-medium text-stone-700 dark:text-stone-200"
          >
            <Film className="w-4 h-4 text-stone-500" />
            Moments (Videos)
          </button>
          <button
            onClick={() => scrollTo('timeline')}
            className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-white/60 dark:hover:bg-stone-800 flex items-center gap-2.5 text-sm font-medium text-stone-700 dark:text-stone-200"
          >
            <Calendar className="w-4 h-4 text-stone-500" />
            Timeline (Stories)
          </button>
          <button
            onClick={() => scrollTo('surprise')}
            className="w-full text-left px-3.5 py-2.5 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-300/40 flex items-center gap-2.5 text-sm font-semibold"
          >
            <Gift className="w-4 h-4" />
            One More Thing... (Surprise)
          </button>
        </div>
      )}
    </header>
  );
};
