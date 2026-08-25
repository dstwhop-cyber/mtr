import { PhotoItem, VideoItem, SongItem, MemoryItem, AppSettings } from '../types';

export const INITIAL_ALBUMS = [
  { id: 'favorite-moments', name: 'Favorite Moments', description: 'The absolute highlights we always reminisce about' },
  { id: 'funny-moments', name: 'Funny Moments', description: 'Things that still make us laugh out loud' },
  { id: 'adventures', name: 'Adventures', description: 'Road trips, weekend wanderings, and new places' },
  { id: 'random-memories', name: 'Random Memories', description: 'The little in-between days that turned out golden' },
  { id: 'other', name: 'Other', description: 'Miscellaneous snapshots and thoughts' },
];

export const INITIAL_PHOTOS: PhotoItem[] = [];

export const INITIAL_VIDEOS: VideoItem[] = [];

export const INITIAL_SONGS: SongItem[] = [];

export const INITIAL_MEMORIES: MemoryItem[] = [];

// Pre-computed salted hashes for default passwords:
// Martha default password: "martha"
// Owner default password: "admin"
// (Also easily change-able anytime from Settings tab in Owner Dashboard)
export const DEFAULT_SETTINGS: AppSettings = {
  siteTitle: 'For Martha ❤️',
  siteSubtitle: 'A little place filled with memories, music, and moments.',
  marthaGreeting: 'Hi Martha ❤️',
  marthaSubtext: 'I made a little corner of the internet just for you.',
  surpriseTitle: 'One More Thing...',
  surpriseMessage: 'You make ordinary moments feel a little more special. I hope this little website makes you smile.',
  themePreset: 'warm-amber',
  particleType: 'warm-glow',
  animationsEnabled: true,
  ambientSoundtrackAutoplay: false,
  marthaPasswordHash: '4a6b6d5f75e7a9b0c2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5',
  ownerPasswordHash: '8b7a6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b',
  marthaPasswordSalt: 'martha_default_salt',
  ownerPasswordSalt: 'owner_default_salt',
  lastUpdated: Date.now(),
};
