export type UserRole = 'guest' | 'martha' | 'owner';

export interface PhotoItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption: string;
  date: string;
  album: string;
  isDemo?: boolean;
  createdAt: number;
  width?: number;
  height?: number;
}

export interface VideoItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title: string;
  description: string;
  date: string;
  duration?: string;
  isDemo?: boolean;
  createdAt: number;
}

export interface SongItem {
  id: string;
  url: string;
  title: string;
  artist: string;
  coverUrl?: string;
  duration?: string;
  isAutoPlay?: boolean;
  order: number;
  isDemo?: boolean;
  createdAt: number;
}

export interface MemoryItem {
  id: string;
  title: string;
  description: string;
  date: string;
  photoUrl?: string;
  videoUrl?: string;
  location?: string;
  tag?: string;
  isDemo?: boolean;
  createdAt: number;
}

export interface AlbumItem {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
}

export type ParticleAnimationType = 'stars' | 'hearts' | 'warm-glow' | 'champagne' | 'none';

export type ThemePreset = 'rose-gold' | 'soft-peach' | 'lavender' | 'sage-green' | 'warm-amber' | 'starry-dusk';

export interface AppSettings {
  siteTitle: string;
  siteSubtitle: string;
  marthaGreeting: string;
  marthaSubtext: string;
  surpriseMessage: string;
  surpriseTitle: string;
  themePreset: ThemePreset;
  particleType: ParticleAnimationType;
  animationsEnabled: boolean;
  ambientSoundtrackAutoplay: boolean;
  marthaPasswordHash: string;
  ownerPasswordHash: string;
  marthaPasswordSalt: string;
  ownerPasswordSalt: string;
  lastUpdated: number;
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}

export interface AuthState {
  role: UserRole;
  isAuthenticated: boolean;
  userEmail?: string;
  loginTime?: number;
}
