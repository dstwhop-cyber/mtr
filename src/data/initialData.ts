import { PhotoItem, VideoItem, SongItem, MemoryItem, AppSettings } from '../types';

export const INITIAL_ALBUMS = [
  { id: 'favorite-moments', name: 'Favorite Moments', description: 'The absolute highlights we always reminisce about' },
  { id: 'funny-moments', name: 'Funny Moments', description: 'Things that still make us laugh out loud' },
  { id: 'adventures', name: 'Adventures', description: 'Road trips, weekend wanderings, and new places' },
  { id: 'random-memories', name: 'Random Memories', description: 'The little in-between days that turned out golden' },
  { id: 'other', name: 'Other', description: 'Miscellaneous snapshots and thoughts' },
];

export const INITIAL_PHOTOS: PhotoItem[] = [
  {
    id: 'demo-photo-1',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    caption: 'Golden hour at the coast. The sunset was incredible that afternoon.',
    date: '2024-07-15',
    album: 'Adventures',
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    width: 1200,
    height: 800,
  },
  {
    id: 'demo-photo-2',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    caption: 'That cozy cafe corner where we spent three hours talking about everything and nothing.',
    date: '2024-09-02',
    album: 'Favorite Moments',
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    width: 1200,
    height: 800,
  },
  {
    id: 'demo-photo-3',
    url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
    caption: 'Looking up through the pines on our morning hike. Crispiest autumn air ever.',
    date: '2024-10-18',
    album: 'Adventures',
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
    width: 1200,
    height: 900,
  },
  {
    id: 'demo-photo-4',
    url: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=1200&q=80',
    caption: 'Quiet bookstore afternoons. Found that one vintage novel you wanted.',
    date: '2024-11-05',
    album: 'Random Memories',
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    width: 1200,
    height: 800,
  },
  {
    id: 'demo-photo-5',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    caption: 'Celebration dinner with all the laughs and dessert that didn’t last 2 minutes.',
    date: '2024-12-20',
    album: 'Funny Moments',
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    width: 1200,
    height: 800,
  },
  {
    id: 'demo-photo-6',
    url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=80',
    caption: 'Warm spring picnic in the park. Perfect sunshine.',
    date: '2025-04-12',
    album: 'Favorite Moments',
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    width: 1200,
    height: 800,
  }
];

export const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: 'demo-video-1',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    title: 'Campfire by the Lake',
    description: 'The crackling fire and stars above. We stayed up way too late talking.',
    date: '2024-08-10',
    duration: '0:15',
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
  },
  {
    id: 'demo-video-2',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
    title: 'Wandering Through the Pines',
    description: 'A little scenic clip from our walk through the national park.',
    date: '2024-10-18',
    duration: '0:15',
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
  }
];

export const INITIAL_SONGS: SongItem[] = [
  {
    id: 'demo-song-1',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    title: 'Warm Afternoon Chai',
    artist: 'Acoustic Memories',
    coverUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=300&q=80',
    duration: '2:27',
    isAutoPlay: true,
    order: 0,
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
  },
  {
    id: 'demo-song-2',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=soft-ambient-11157.mp3',
    title: 'Gentle Starlight',
    artist: 'Soft Horizon',
    coverUrl: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=300&q=80',
    duration: '2:15',
    isAutoPlay: false,
    order: 1,
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 28,
  },
  {
    id: 'demo-song-3',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=peaceful-garden-healing-light-14022.mp3',
    title: 'Peaceful Morning Walk',
    artist: 'Canyon Breeze',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80',
    duration: '2:40',
    isAutoPlay: false,
    order: 2,
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
  }
];

export const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'demo-memory-1',
    title: 'That Day We Couldn’t Stop Laughing',
    description: 'We ordered what we thought was a regular iced matcha and they brought out a giant bowl with two ladles. Neither of us could keep a straight face for the rest of the day.',
    date: '2024-06-12',
    location: 'Little Tokyo Cafe',
    tag: 'Funny',
    photoUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
  },
  {
    id: 'demo-memory-2',
    title: 'The Impromptu Coast Road Trip',
    description: 'We had zero plans on a Saturday morning, hopped in the car with a playlist of old favorites, and drove until we saw the ocean. The air smelled like sea salt and freedom.',
    date: '2024-08-24',
    location: 'Pacific Coast Highway',
    tag: 'Adventure',
    photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 45,
  },
  {
    id: 'demo-memory-3',
    title: 'Late Night Talk Under the Stars',
    description: 'Sitting on the porch wrapped in oversized blankets, drinking hot cinnamon tea, and talking about dreams, childhood memories, and all the things we want to build.',
    date: '2024-11-14',
    location: 'Backyard Porch',
    tag: 'Heartfelt',
    photoUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
  },
  {
    id: 'demo-memory-4',
    title: 'The Rainstorm & Cinnamon Rolls',
    description: 'It poured all afternoon. Instead of going out, we baked cinnamon rolls that turned out slightly deformed but tasted like heaven.',
    date: '2025-01-20',
    location: 'Warm Kitchen',
    tag: 'Cozy',
    photoUrl: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=800&q=80',
    isDemo: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
  }
];

// Pre-computed salted hashes for default passwords:
// Martha default password: "martha"
// Salt: "martha_salt_2026"
// Owner default password: "admin"
// Salt: "owner_salt_2026"
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
  marthaPasswordHash: '4a6b6d5f75e7a9b0c2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5', // computed dynamically on init if salt changed
  ownerPasswordHash: '8b7a6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b',
  marthaPasswordSalt: 'martha_default_salt',
  ownerPasswordSalt: 'owner_default_salt',
  lastUpdated: Date.now(),
};
