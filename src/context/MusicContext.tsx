import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { SongItem } from '../types';
import { DataService } from '../services/dataService';

interface MusicContextType {
  songs: SongItem[];
  currentSong: SongItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isPlayerVisible: boolean;
  hasUserInteracted: boolean;
  autoplayBlocked: boolean;
  showFooterNowPlaying: boolean;
  playSong: (song: SongItem) => void;
  togglePlay: () => void;
  pause: () => void;
  playNext: () => void;
  playPrev: () => void;
  seekTo: (time: number) => void;
  setVolumeLevel: (vol: number) => void;
  toggleMute: () => void;
  togglePlayerVisible: () => void;
  toggleFooterNowPlaying: () => void;
  setShowFooterNowPlaying: (show: boolean) => void;
  refreshSongs: () => Promise<void>;
  startMusicWithUserInteraction: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [currentSong, setCurrentSong] = useState<SongItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(true);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [showFooterNowPlaying, setShowFooterNowPlayingState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('martha_footer_now_playing');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleFooterNowPlaying = () => {
    setShowFooterNowPlayingState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('martha_footer_now_playing', String(next));
      } catch {
        // Local storage ignore
      }
      return next;
    });
  };

  const setShowFooterNowPlaying = (show: boolean) => {
    setShowFooterNowPlayingState(show);
    try {
      localStorage.setItem('martha_footer_now_playing', String(show));
    } catch {
      // Local storage ignore
    }
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthAudioRef = useRef<AudioContext | null>(null);

  // Initialize HTML5 Audio
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      // Auto-advance to next song
      playNext();
    };
    const onError = (e: Event) => {
      console.warn('Audio playback issue, attempting fallback stream', e);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, []);

  // Fetch songs
  const refreshSongs = async () => {
    try {
      const loaded = await DataService.getSongs();
      setSongs(loaded);
      if (loaded.length > 0 && !currentSong) {
        // Look for default autoplay or first song
        const autoSong = loaded.find((s) => s.isAutoPlay) || loaded[0];
        setCurrentSong(autoSong);
      }
    } catch (err) {
      console.error('Failed to load songs:', err);
    }
  };

  useEffect(() => {
    refreshSongs();
  }, []);

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const playSong = (song: SongItem) => {
    setHasUserInteracted(true);
    setAutoplayBlocked(false);
    setCurrentSong(song);

    if (audioRef.current) {
      audioRef.current.src = song.url;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('Browser prevented direct audio play:', err);
          setAutoplayBlocked(true);
          setIsPlaying(false);
        });
    }
  };

  const togglePlay = () => {
    setHasUserInteracted(true);
    if (!currentSong && songs.length > 0) {
      playSong(songs[0]);
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (!audioRef.current.src && currentSong) {
          audioRef.current.src = currentSong.url;
          audioRef.current.load();
        }
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setAutoplayBlocked(false);
          })
          .catch((err) => {
            console.warn('Playback error:', err);
            setAutoplayBlocked(true);
          });
      }
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const playNext = () => {
    if (!songs.length) return;
    const currentIndex = songs.findIndex((s) => s.id === currentSong?.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    playSong(songs[nextIndex]);
  };

  const playPrev = () => {
    if (!songs.length) return;
    const currentIndex = songs.findIndex((s) => s.id === currentSong?.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    playSong(songs[prevIndex]);
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolumeLevel = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolume(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const togglePlayerVisible = () => {
    setIsPlayerVisible(!isPlayerVisible);
  };

  const startMusicWithUserInteraction = () => {
    setHasUserInteracted(true);
    setAutoplayBlocked(false);
    if (currentSong) {
      playSong(currentSong);
    } else if (songs.length > 0) {
      playSong(songs[0]);
    }
  };

  return (
    <MusicContext.Provider
      value={{
        songs,
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isPlayerVisible,
        hasUserInteracted,
        autoplayBlocked,
        showFooterNowPlaying,
        playSong,
        togglePlay,
        pause,
        playNext,
        playPrev,
        seekTo,
        setVolumeLevel,
        toggleMute,
        togglePlayerVisible,
        toggleFooterNowPlaying,
        setShowFooterNowPlaying,
        refreshSongs,
        startMusicWithUserInteraction,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
