import React, { useState } from 'react';
import { useMusic } from '../../context/MusicContext';
import { useSettings } from '../../context/SettingsContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  ListMusic,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export const MusicPlayerBar: React.FC = () => {
  const {
    songs,
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isPlayerVisible,
    autoplayBlocked,
    playSong,
    togglePlay,
    playNext,
    playPrev,
    seekTo,
    setVolumeLevel,
    toggleMute,
    togglePlayerVisible,
    startMusicWithUserInteraction,
  } = useMusic();

  const { themeClasses } = useSettings();
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

  if (!songs.length) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const activeSong = currentSong || songs[0];

  return (
    <>
      {/* Floating Prompt if Autoplay was blocked or hasn't started */}
      {(!isPlaying || autoplayBlocked) && (
        <div className="fixed bottom-24 right-4 sm:right-8 z-30 animate-bounce">
          <button
            onClick={startMusicWithUserInteraction}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl ${themeClasses.accentBg} text-white text-xs sm:text-sm font-medium hover:scale-105 transition-transform duration-200 border border-white/30 backdrop-blur-md`}
          >
            <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
            <span>🎵 Play something nice</span>
          </button>
        </div>
      )}

      {/* Mini Player Collapsed Button */}
      {!isPlayerVisible && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={togglePlayerVisible}
            className={`w-12 h-12 rounded-full ${themeClasses.accentBg} text-white shadow-xl flex items-center justify-center hover:scale-110 transition group border-2 border-white/80 backdrop-blur-md`}
            title="Show Music Player"
          >
            <Music className={`w-5 h-5 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
          </button>
        </div>
      )}

      {/* Persistent Full Frosted Glass Player Bar */}
      {isPlayerVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/65 dark:bg-stone-900/65 backdrop-blur-2xl border-t border-white/70 dark:border-white/10 shadow-2xl transition-all duration-300">
          {/* Top Progress bar scrubber */}
          <div className="relative w-full h-1.5 bg-stone-200/60 dark:bg-stone-800/60 cursor-pointer group backdrop-blur-xs">
            <div
              className={`h-full ${themeClasses.accentBg} relative transition-all`}
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            >
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow border border-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Seek timeline"
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Artwork & Info */}
            <div className="flex items-center space-x-3 min-w-0 flex-1 sm:flex-initial">
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100 dark:bg-stone-800 border border-white/60 dark:border-stone-700 shadow-sm">
                {activeSong.coverUrl ? (
                  <img
                    src={activeSong.coverUrl}
                    alt={activeSong.title}
                    className={`w-full h-full object-cover ${isPlaying ? 'rotate-animation' : ''}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    <Music className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 pr-2">
                <p className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                  {activeSong.title}
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                  {activeSong.artist || 'Special Soundtrack'}
                </p>
              </div>
            </div>

            {/* Center: Controls */}
            <div className="flex flex-col items-center justify-center flex-shrink-0">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={playPrev}
                  className="p-1.5 rounded-full hover:bg-white/60 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition"
                  aria-label="Previous track"
                >
                  <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <button
                  onClick={togglePlay}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${themeClasses.accentBg} text-white flex items-center justify-center shadow-md hover:scale-105 transition border border-white/30`}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={playNext}
                  className="p-1.5 rounded-full hover:bg-white/60 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition"
                  aria-label="Next track"
                >
                  <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <div className="hidden md:flex items-center space-x-1 text-[10px] text-stone-400 mt-0.5">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right: Volume & Playlist Drawer & Minimize */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Volume Slider */}
              <div className="hidden sm:flex items-center space-x-1.5">
                <button
                  onClick={toggleMute}
                  className="p-1.5 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
                  className="w-16 sm:w-20 h-1 bg-stone-300/80 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  aria-label="Volume control"
                />
              </div>

              {/* Playlist button */}
              <button
                onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
                className={`p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-white/60 dark:hover:bg-stone-800 transition ${
                  isPlaylistOpen ? 'bg-white/80 dark:bg-stone-800 shadow-xs border border-white/60' : ''
                }`}
                title="Playlist"
              >
                <ListMusic className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Hide player button */}
              <button
                onClick={togglePlayerVisible}
                className="p-1.5 rounded-full hover:bg-white/60 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                title="Minimize player"
              >
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Frosted Playlist Drawer Modal */}
      {isPlaylistOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex justify-end"
          onClick={() => setIsPlaylistOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white/80 dark:bg-stone-900/85 backdrop-blur-2xl h-full shadow-2xl p-5 flex flex-col justify-between border-l border-white/70 dark:border-white/10 animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-200/60 dark:border-stone-800">
                <div className="flex items-center space-x-2">
                  <ListMusic className="w-5 h-5 text-amber-600" />
                  <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-lg">
                    Soundtrack Playlist
                  </h3>
                </div>
                <button
                  onClick={() => setIsPlaylistOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-white/60"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-2 overflow-y-auto max-h-[calc(100vh-160px)] pr-1">
                {songs.map((song, index) => {
                  const isCurrent = currentSong?.id === song.id;
                  return (
                    <div
                      key={song.id}
                      onClick={() => {
                        playSong(song);
                        setIsPlaylistOpen(false);
                      }}
                      className={`flex items-center space-x-3 p-2.5 rounded-xl cursor-pointer transition ${
                        isCurrent
                          ? `${themeClasses.badgeBg} font-medium shadow-xs`
                          : 'hover:bg-white/60 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <span className="text-xs font-mono text-stone-400 w-4">
                        {index + 1}
                      </span>
                      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-stone-200/70 dark:bg-stone-800 border border-white/40">
                        {song.coverUrl ? (
                          <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <Music className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium truncate">{song.title}</p>
                        <p className="text-[11px] text-stone-500 truncate">{song.artist}</p>
                      </div>
                      {isCurrent && isPlaying && (
                        <div className="flex space-x-0.5 items-end h-3">
                          <span className="w-0.5 h-2 bg-amber-600 animate-pulse" />
                          <span className="w-0.5 h-3 bg-amber-600 animate-pulse" />
                          <span className="w-0.5 h-1.5 bg-amber-600 animate-pulse" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200/60 dark:border-stone-800 text-center text-xs text-stone-400">
              {songs.length} gentle song{songs.length === 1 ? '' : 's'} for your space
            </div>
          </div>
        </div>
      )}
    </>
  );
};
