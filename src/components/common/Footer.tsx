import React from 'react';
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Radio,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useMusic } from '../../context/MusicContext';

export const Footer: React.FC = () => {
  const { settings, themeClasses } = useSettings();
  const {
    songs,
    currentSong,
    isPlaying,
    currentTime,
    duration,
    isMuted,
    toggleMute,
    togglePlay,
    playNext,
    playPrev,
    showFooterNowPlaying,
    toggleFooterNowPlaying,
    startMusicWithUserInteraction,
  } = useMusic();

  const activeSong = currentSong || (songs.length > 0 ? songs[0] : null);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <footer className="w-full py-8 mt-16 border-t border-white/50 dark:border-white/10 text-center text-xs text-stone-500 dark:text-stone-400 bg-white/30 dark:bg-stone-900/30 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center justify-center space-y-5">
        {/* Toggleable Visual Now Playing Indicator Section */}
        {songs.length > 0 && (
          <div className="w-full max-w-lg">
            {showFooterNowPlaying ? (
              /* Expanded Visual Now Playing Card */
              <div className="relative overflow-hidden rounded-2xl bg-white/75 dark:bg-stone-900/80 backdrop-blur-xl border border-white/80 dark:border-stone-700/60 shadow-lg p-4 transition-all duration-300">
                {/* Subtle animated ambient background glow */}
                <div
                  className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-40 ${
                    isPlaying ? 'bg-amber-400/50 dark:bg-amber-500/30 animate-pulse' : 'bg-stone-300/30'
                  }`}
                />

                {/* Top header row of the indicator card */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-stone-200/60 dark:border-stone-800 text-[11px]">
                  <div className="flex items-center gap-2 font-medium text-stone-700 dark:text-stone-300">
                    <span className="relative flex h-2.5 w-2.5">
                      {isPlaying && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      )}
                      <span
                        className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                          isPlaying ? 'bg-emerald-500' : 'bg-stone-400'
                        }`}
                      />
                    </span>
                    <span className="font-serif tracking-wide">
                      {isPlaying ? 'Now Playing' : 'Soundtrack Ready'}
                    </span>
                    {isPlaying && (
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-mono">
                        LIVE
                      </span>
                    )}
                  </div>

                  {/* Martha Toggle Button */}
                  <button
                    onClick={toggleFooterNowPlaying}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition text-[11px] font-medium"
                    title="Hide Now Playing Indicator in Footer"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide Indicator</span>
                  </button>
                </div>

                {/* Main Content: Album art + Info + Equalizer wave */}
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Thumbnail and Track info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1 text-left">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100 dark:bg-stone-800 border border-white/80 dark:border-stone-700 shadow-xs">
                      {activeSong?.coverUrl ? (
                        <img
                          src={activeSong.coverUrl}
                          alt={activeSong.title}
                          className={`w-full h-full object-cover ${
                            isPlaying ? 'rotate-animation' : ''
                          }`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-amber-600 dark:text-amber-400">
                          <Music className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                        {activeSong?.title || 'Gentle Melody'}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                        {activeSong?.artist || 'Special Soundtrack'}
                      </p>
                    </div>
                  </div>

                  {/* Center/Right: Animated Equalizer Sound Waves */}
                  <div className="flex items-end gap-1 h-7 px-2 flex-shrink-0">
                    <span
                      className={`w-1 rounded-full bg-amber-500 transition-all duration-300 ${
                        isPlaying
                          ? 'h-6 animate-[bounce_0.8s_ease-in-out_infinite]'
                          : 'h-2 opacity-40'
                      }`}
                    />
                    <span
                      className={`w-1 rounded-full bg-rose-500 transition-all duration-300 ${
                        isPlaying
                          ? 'h-4 animate-[bounce_1.1s_ease-in-out_infinite_0.2s]'
                          : 'h-3 opacity-40'
                      }`}
                    />
                    <span
                      className={`w-1 rounded-full bg-amber-600 transition-all duration-300 ${
                        isPlaying
                          ? 'h-7 animate-[bounce_0.9s_ease-in-out_infinite_0.4s]'
                          : 'h-1.5 opacity-40'
                      }`}
                    />
                    <span
                      className={`w-1 rounded-full bg-rose-400 transition-all duration-300 ${
                        isPlaying
                          ? 'h-5 animate-[bounce_1.2s_ease-in-out_infinite_0.1s]'
                          : 'h-2 opacity-40'
                      }`}
                    />
                    <span
                      className={`w-1 rounded-full bg-amber-400 transition-all duration-300 ${
                        isPlaying
                          ? 'h-3.5 animate-[bounce_0.7s_ease-in-out_infinite_0.3s]'
                          : 'h-1 opacity-40'
                      }`}
                    />
                  </div>

                  {/* Quick Controls */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={playPrev}
                      className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition"
                      aria-label="Previous Song"
                      title="Previous"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>

                    <button
                      onClick={isPlaying ? togglePlay : startMusicWithUserInteraction}
                      className={`w-8 h-8 rounded-full ${themeClasses.accentBg} text-white flex items-center justify-center shadow-sm hover:scale-105 transition`}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>

                    <button
                      onClick={playNext}
                      className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition"
                      aria-label="Next Song"
                      title="Next"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>

                    <button
                      onClick={toggleMute}
                      className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-rose-500" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Progress bar line */}
                <div className="mt-3 w-full bg-stone-200/70 dark:bg-stone-800 rounded-full h-1 overflow-hidden">
                  <div
                    className={`h-full ${themeClasses.accentBg} transition-all duration-300`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-stone-400 mt-1 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            ) : (
              /* Collapsed / Toggle-on pill for Martha */
              <div className="flex items-center justify-center">
                <button
                  onClick={toggleFooterNowPlaying}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-stone-800/80 hover:bg-white dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/80 shadow-xs hover:shadow-sm transition-all duration-200 text-xs font-medium group"
                  title="Show Visual Now Playing in Footer"
                >
                  <Radio className={`w-3.5 h-3.5 ${isPlaying ? 'text-amber-500 animate-pulse' : 'text-stone-400'}`} />
                  <span>Show Now Playing</span>
                  {isPlaying && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                  <Eye className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-200 transition" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer Subtext */}
        <div className="space-y-1">
          <p className="text-stone-700 dark:text-stone-300 font-medium">
            especially for Martha
          </p>
          <p className="text-stone-400 dark:text-stone-500 text-[11px]">
            {settings.siteTitle || 'For Martha'} • A private digital memory space & scrapbook
          </p>
        </div>
      </div>
    </footer>
  );
};
