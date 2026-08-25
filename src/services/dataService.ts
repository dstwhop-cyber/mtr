import {
  PhotoItem,
  VideoItem,
  SongItem,
  MemoryItem,
  AlbumItem,
  AppSettings,
} from '../types';
import {
  INITIAL_PHOTOS,
  INITIAL_VIDEOS,
  INITIAL_SONGS,
  INITIAL_MEMORIES,
  INITIAL_ALBUMS,
  DEFAULT_SETTINGS,
} from '../data/initialData';
import { getFirebaseInstances } from '../lib/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { saveMediaBlob, deleteMediaBlob, getMediaBlobUrl } from '../utils/storage';
import { hashPassword } from '../utils/crypto';

// Local storage keys
const LS_PHOTOS = 'for_martha_photos';
const LS_VIDEOS = 'for_martha_videos';
const LS_SONGS = 'for_martha_songs';
const LS_MEMORIES = 'for_martha_memories';
const LS_ALBUMS = 'for_martha_albums';
const LS_SETTINGS = 'for_martha_settings';

// Offline circuit breaker to prevent repeated failed network requests and log flooding
let isFirestoreTemporarilyOffline = false;
let lastOfflineCheck = 0;
const OFFLINE_RETRY_COOLDOWN = 30000; // 30 seconds cooldown before retrying cloud if offline

function shouldTryFirestore(): boolean {
  if (!isFirestoreTemporarilyOffline) return true;
  if (Date.now() - lastOfflineCheck > OFFLINE_RETRY_COOLDOWN) {
    isFirestoreTemporarilyOffline = false;
    return true;
  }
  return false;
}

function markFirestoreOffline(): void {
  isFirestoreTemporarilyOffline = true;
  lastOfflineCheck = Date.now();
}

async function withFirestoreTimeout<T>(promise: Promise<T>, timeoutMs = 2000): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Firestore timeout'));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (err) {
    clearTimeout(timeoutId!);
    throw err;
  }
}

export class DataService {
  private static async getLocalItem<T>(key: string, defaultVal: T): Promise<T> {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return defaultVal;
      return JSON.parse(stored) as T;
    } catch {
      return defaultVal;
    }
  }

  private static setLocalItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota/storage restrictions gracefully
    }
  }

  // Filter out any leftover demo items
  private static filterOutDemos<T extends { isDemo?: boolean; id?: string }>(items: T[]): T[] {
    return items.filter((item) => !item.isDemo && !item.id?.startsWith('demo-'));
  }

  private static sanitizeSettings(s: AppSettings): AppSettings {
    const removeHearts = (str?: string) => (str ? str.replace(/[❤️💖💕💗💓💘💝💟❣️]/g, '').trim() : str);
    return {
      ...s,
      siteTitle: removeHearts(s.siteTitle) || 'For Martha',
      marthaGreeting: removeHearts(s.marthaGreeting) || 'Hi Martha',
      marthaSubtext: removeHearts(s.marthaSubtext) || s.marthaSubtext,
      surpriseTitle: removeHearts(s.surpriseTitle) || s.surpriseTitle,
      surpriseMessage: removeHearts(s.surpriseMessage) || s.surpriseMessage,
    };
  }

  // --- SETTINGS & CONFIG ---
  static async getSettings(): Promise<AppSettings> {
    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db && shouldTryFirestore()) {
      try {
        const docSnap = await withFirestoreTimeout(getDoc(doc(db, 'settings', 'global')), 1500);
        if (docSnap && docSnap.exists()) {
          return this.sanitizeSettings({ ...DEFAULT_SETTINGS, ...docSnap.data() } as AppSettings);
        }
      } catch {
        markFirestoreOffline();
      }
    }

    const localSettings = await this.getLocalItem<AppSettings>(LS_SETTINGS, DEFAULT_SETTINGS);
    // Ensure default hashes are set if not present
    if (!localSettings.marthaPasswordHash || localSettings.marthaPasswordHash.length < 20) {
      const marthaHash = await hashPassword('martha', localSettings.marthaPasswordSalt || 'martha_salt_2026');
      const ownerHash = await hashPassword('admin', localSettings.ownerPasswordSalt || 'owner_salt_2026');
      localSettings.marthaPasswordHash = marthaHash;
      localSettings.ownerPasswordHash = ownerHash;
      this.setLocalItem(LS_SETTINGS, localSettings);
    }
    const cleanSettings = this.sanitizeSettings(localSettings);
    if (cleanSettings.siteTitle !== localSettings.siteTitle || cleanSettings.marthaGreeting !== localSettings.marthaGreeting) {
      this.setLocalItem(LS_SETTINGS, cleanSettings);
    }
    return cleanSettings;
  }

  static async saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated: AppSettings = {
      ...current,
      ...settings,
      lastUpdated: Date.now(),
    };

    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db && shouldTryFirestore()) {
      try {
        await withFirestoreTimeout(setDoc(doc(db, 'settings', 'global'), updated, { merge: true }), 2000);
      } catch {
        markFirestoreOffline();
      }
    }

    this.setLocalItem(LS_SETTINGS, updated);
    return updated;
  }

  // --- PHOTOS ---
  static async getPhotos(): Promise<PhotoItem[]> {
    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db && shouldTryFirestore()) {
      try {
        const querySnapshot = await withFirestoreTimeout(getDocs(collection(db, 'photos')), 1500);
        const list: PhotoItem[] = [];
        querySnapshot.forEach((d) => {
          const data = d.data() as PhotoItem;
          if (!data.isDemo && !d.id.startsWith('demo-')) {
            list.push({ ...data, id: d.id });
          }
        });
        if (list.length > 0) {
          list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          this.setLocalItem(LS_PHOTOS, list);
          return list;
        }
      } catch {
        markFirestoreOffline();
      }
    }

    const stored = await this.getLocalItem<PhotoItem[]>(LS_PHOTOS, INITIAL_PHOTOS);
    const cleaned = this.filterOutDemos(stored);
    
    // Refresh any IndexedDB blob URLs if needed
    for (const photo of cleaned) {
      if (photo.url && photo.url.startsWith('indexeddb://')) {
        const id = photo.url.replace('indexeddb://', '');
        const blobUrl = await getMediaBlobUrl(id);
        if (blobUrl) photo.url = blobUrl;
      }
    }
    
    if (cleaned.length !== stored.length) {
      this.setLocalItem(LS_PHOTOS, cleaned);
    }
    
    return cleaned.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  static async addPhoto(photo: Omit<PhotoItem, 'id' | 'createdAt'>): Promise<PhotoItem> {
    const id = 'photo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newPhoto: PhotoItem = {
      ...photo,
      id,
      isDemo: false,
      createdAt: Date.now(),
    };

    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db && shouldTryFirestore()) {
      try {
        await withFirestoreTimeout(setDoc(doc(db, 'photos', id), newPhoto), 2000);
      } catch {
        markFirestoreOffline();
      }
    }

    const current = await this.getLocalItem<PhotoItem[]>(LS_PHOTOS, INITIAL_PHOTOS);
    const cleaned = this.filterOutDemos(current);
    const updated = [newPhoto, ...cleaned];
    this.setLocalItem(LS_PHOTOS, updated);
    await this.touchUpdated();
    return newPhoto;
  }

  static async updatePhoto(id: string, updates: Partial<PhotoItem>): Promise<void> {
    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db && shouldTryFirestore()) {
      try {
        await withFirestoreTimeout(updateDoc(doc(db, 'photos', id), updates), 2000);
      } catch {
        markFirestoreOffline();
      }
    }

    const current = await this.getLocalItem<PhotoItem[]>(LS_PHOTOS, INITIAL_PHOTOS);
    const updated = current.map((item) => (item.id === id ? { ...item, ...updates } : item));
    this.setLocalItem(LS_PHOTOS, updated);
    await this.touchUpdated();
  }

  static async deletePhoto(id: string): Promise<boolean> {
    const { db, storage, isConfigured } = getFirebaseInstances();
    if (isConfigured && db && shouldTryFirestore()) {
      try {
        await withFirestoreTimeout(deleteDoc(doc(db, 'photos', id)), 2000);
      } catch {
        markFirestoreOffline();
      }
      if (storage) {
        try {
          const fileRef = ref(storage, `photos/${id}`);
          await deleteObject(fileRef).catch(() => {});
        } catch {
          // Ignore storage cleanup error
        }
      }
    }

    await deleteMediaBlob(id);
    const current = await this.getLocalItem<PhotoItem[]>(LS_PHOTOS, INITIAL_PHOTOS);
    const updated = current.filter((item) => item.id !== id);
    this.setLocalItem(LS_PHOTOS, updated);
    await this.touchUpdated();
    return true;
  }

  // --- VIDEOS ---
  static async getVideos(): Promise<VideoItem[]> {
    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db && shouldTryFirestore()) {
      try {
        const querySnapshot = await withFirestoreTimeout(getDocs(collection(db, 'videos')), 1500);
        const list: VideoItem[] = [];
        querySnapshot.forEach((d) => {
          const data = d.data() as VideoItem;
          if (!data.isDemo && !d.id.startsWith('demo-')) {
            list.push({ ...data, id: d.id });
          }
        });
        if (list.length > 0) {
          list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          this.setLocalItem(LS_VIDEOS, list);
          return list;
        }
      } catch {
        markFirestoreOffline();
      }
    }

    const stored = await this.getLocalItem<VideoItem[]>(LS_VIDEOS, INITIAL_VIDEOS);
    const cleaned = this.filterOutDemos(stored);
    
    // Refresh any IndexedDB blob URLs if needed
    for (const vid of cleaned) {
      if (vid.url && vid.url.startsWith('indexeddb://')) {
        const id = vid.url.replace('indexeddb://', '');
        const blobUrl = await getMediaBlobUrl(id);
        if (blobUrl) vid.url = blobUrl;
      }
      if (vid.thumbnailUrl && vid.thumbnailUrl.startsWith('indexeddb://')) {
        const thumbId = vid.thumbnailUrl.replace('indexeddb://', '');
        const thumbBlob = await getMediaBlobUrl(thumbId);
        if (thumbBlob) vid.thumbnailUrl = thumbBlob;
      }
    }
    
    if (cleaned.length !== stored.length) {
      this.setLocalItem(LS_VIDEOS, cleaned);
    }
    
    return cleaned.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  static async addVideo(video: Omit<VideoItem, 'id' | 'createdAt'>): Promise<VideoItem> {
    const id = 'vid_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newVideo: VideoItem = {
      ...video,
      id,
      isDemo: false,
      createdAt: Date.now(),
    };

    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db && shouldTryFirestore()) {
      try {
        await withFirestoreTimeout(setDoc(doc(db, 'videos', id), newVideo), 2000);
      } catch {
        markFirestoreOffline();
      }
    }

    const current = await this.getLocalItem<VideoItem[]>(LS_VIDEOS, INITIAL_VIDEOS);
    const cleaned = this.filterOutDemos(current);
    const updated = [newVideo, ...cleaned];
    this.setLocalItem(LS_VIDEOS, updated);
    await this.touchUpdated();
    return newVideo;
  }

  static async deleteVideo(id: string): Promise<boolean> {
    const { db, storage, isConfigured } = getFirebaseInstances();
    if (isConfigured && db && shouldTryFirestore()) {
      try {
        await withFirestoreTimeout(deleteDoc(doc(db, 'videos', id)), 2000);
      } catch {
        markFirestoreOffline();
      }
      if (storage) {
        try {
          const fileRef = ref(storage, `videos/${id}`);
          await deleteObject(fileRef).catch(() => {});
        } catch {
          // Storage cleanup ignore
        }
      }
    }

    await deleteMediaBlob(id);
    const current = await this.getLocalItem<VideoItem[]>(LS_VIDEOS, INITIAL_VIDEOS);
    const updated = current.filter((item) => item.id !== id);
    this.setLocalItem(LS_VIDEOS, updated);
    await this.touchUpdated();
    return true;
  }

  // --- SONGS ---
  static async getSongs(): Promise<SongItem[]> {
    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db && shouldTryFirestore()) {
      try {
        const querySnapshot = await withFirestoreTimeout(getDocs(collection(db, 'songs')), 1500);
        const list: SongItem[] = [];
        querySnapshot.forEach((d) => {
          const data = d.data() as SongItem;
          if (!data.isDemo && !d.id.startsWith('demo-')) {
            list.push({ ...data, id: d.id });
          }
        });
        if (list.length > 0) {
          list.sort((a, b) => (a.order || 0) - (b.order || 0));
          this.setLocalItem(LS_SONGS, list);
          return list;
        }
      } catch {
        markFirestoreOffline();
      }
    }

    const stored = await this.getLocalItem<SongItem[]>(LS_SONGS, INITIAL_SONGS);
    const cleaned = this.filterOutDemos(stored);
    
    // Refresh any IndexedDB blob URLs if needed
    for (const song of cleaned) {
      if (song.url && song.url.startsWith('indexeddb://')) {
        const id = song.url.replace('indexeddb://', '');
        const blobUrl = await getMediaBlobUrl(id);
        if (blobUrl) song.url = blobUrl;
      }
      if (song.coverUrl && song.coverUrl.startsWith('indexeddb://')) {
        const coverId = song.coverUrl.replace('indexeddb://', '');
        const coverBlob = await getMediaBlobUrl(coverId);
        if (coverBlob) song.coverUrl = coverBlob;
      }
    }
    
    if (cleaned.length !== stored.length) {
      this.setLocalItem(LS_SONGS, cleaned);
    }
    
    return cleaned.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  static async addSong(song: Omit<SongItem, 'id' | 'createdAt'>): Promise<SongItem> {
    const id = 'song_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const current = await this.getLocalItem<SongItem[]>(LS_SONGS, INITIAL_SONGS);
    const cleaned = this.filterOutDemos(current);

    const newSong: SongItem = {
      ...song,
      id,
      isDemo: false,
      order: song.order ?? cleaned.length,
      createdAt: Date.now(),
    };

    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db && shouldTryFirestore()) {
      try {
        await withFirestoreTimeout(setDoc(doc(db, 'songs', id), newSong), 2000);
      } catch {
        markFirestoreOffline();
      }
    }

    const updated = [...cleaned, newSong];
    this.setLocalItem(LS_SONGS, updated);
    await this.touchUpdated();
    return newSong;
  }

  static async updateSong(id: string, updates: Partial<SongItem>): Promise<void> {
    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db && shouldTryFirestore()) {
      try {
        await withFirestoreTimeout(updateDoc(doc(db, 'songs', id), updates), 2000);
      } catch {
        markFirestoreOffline();
      }
    }

    const current = await this.getLocalItem<SongItem[]>(LS_SONGS, INITIAL_SONGS);
    const updated = current.map((item) => (item.id === id ? { ...item, ...updates } : item));
    this.setLocalItem(LS_SONGS, updated);
    await this.touchUpdated();
  }

  static async deleteSong(id: string): Promise<boolean> {
    const { db, storage, isConfigured } = getFirebaseInstances();
    if (isConfigured && db && shouldTryFirestore()) {
      try {
        await withFirestoreTimeout(deleteDoc(doc(db, 'songs', id)), 2000);
      } catch {
        markFirestoreOffline();
      }
      if (storage) {
        try {
          const fileRef = ref(storage, `songs/${id}`);
          await deleteObject(fileRef).catch(() => {});
        } catch {
          // Storage ignore
        }
      }
    }

    await deleteMediaBlob(id);
    const current = await this.getLocalItem<SongItem[]>(LS_SONGS, INITIAL_SONGS);
    const updated = current.filter((item) => item.id !== id);
    this.setLocalItem(LS_SONGS, updated);
    await this.touchUpdated();
    return true;
  }

  // --- MEMORIES ---
  static async getMemories(): Promise<MemoryItem[]> {
    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db && shouldTryFirestore()) {
      try {
        const querySnapshot = await withFirestoreTimeout(getDocs(collection(db, 'memories')), 1500);
        const list: MemoryItem[] = [];
        querySnapshot.forEach((d) => {
          const data = d.data() as MemoryItem;
          if (!data.isDemo && !d.id.startsWith('demo-')) {
            list.push({ ...data, id: d.id });
          }
        });
        if (list.length > 0) {
          list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          this.setLocalItem(LS_MEMORIES, list);
          return list;
        }
      } catch {
        markFirestoreOffline();
      }
    }

    const stored = await this.getLocalItem<MemoryItem[]>(LS_MEMORIES, INITIAL_MEMORIES);
    const cleaned = this.filterOutDemos(stored);
    
    // Refresh any IndexedDB blob URLs if needed
    for (const mem of cleaned) {
      if (mem.photoUrl && mem.photoUrl.startsWith('indexeddb://')) {
        const id = mem.photoUrl.replace('indexeddb://', '');
        const blobUrl = await getMediaBlobUrl(id);
        if (blobUrl) mem.photoUrl = blobUrl;
      }
    }
    
    if (cleaned.length !== stored.length) {
      this.setLocalItem(LS_MEMORIES, cleaned);
    }
    
    return cleaned.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async addMemory(memory: Omit<MemoryItem, 'id' | 'createdAt'>): Promise<MemoryItem> {
    const id = 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newMem: MemoryItem = {
      ...memory,
      id,
      isDemo: false,
      createdAt: Date.now(),
    };

    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db && shouldTryFirestore()) {
      try {
        await withFirestoreTimeout(setDoc(doc(db, 'memories', id), newMem), 2000);
      } catch {
        markFirestoreOffline();
      }
    }

    const current = await this.getLocalItem<MemoryItem[]>(LS_MEMORIES, INITIAL_MEMORIES);
    const cleaned = this.filterOutDemos(current);
    const updated = [newMem, ...cleaned];
    this.setLocalItem(LS_MEMORIES, updated);
    await this.touchUpdated();
    return newMem;
  }

  static async updateMemory(id: string, updates: Partial<MemoryItem>): Promise<void> {
    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db && shouldTryFirestore()) {
      try {
        await withFirestoreTimeout(updateDoc(doc(db, 'memories', id), updates), 2000);
      } catch {
        markFirestoreOffline();
      }
    }

    const current = await this.getLocalItem<MemoryItem[]>(LS_MEMORIES, INITIAL_MEMORIES);
    const updated = current.map((item) => (item.id === id ? { ...item, ...updates } : item));
    this.setLocalItem(LS_MEMORIES, updated);
    await this.touchUpdated();
  }

  static async deleteMemory(id: string): Promise<boolean> {
    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db && shouldTryFirestore()) {
      try {
        await withFirestoreTimeout(deleteDoc(doc(db, 'memories', id)), 2000);
      } catch {
        markFirestoreOffline();
      }
    }

    const current = await this.getLocalItem<MemoryItem[]>(LS_MEMORIES, INITIAL_MEMORIES);
    const updated = current.filter((m) => m.id !== id);
    this.setLocalItem(LS_MEMORIES, updated);
    await this.touchUpdated();
    return true;
  }

  // --- ALBUMS ---
  static async getAlbums(): Promise<AlbumItem[]> {
    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db && shouldTryFirestore()) {
      try {
        const querySnapshot = await withFirestoreTimeout(getDocs(collection(db, 'albums')), 1500);
        const list: AlbumItem[] = [];
        querySnapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as AlbumItem));
        if (list.length > 0) return list;
      } catch {
        markFirestoreOffline();
      }
    }
    return this.getLocalItem<AlbumItem[]>(LS_ALBUMS, INITIAL_ALBUMS);
  }

  static async saveAlbums(albums: AlbumItem[]): Promise<void> {
    this.setLocalItem(LS_ALBUMS, albums);
    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db && shouldTryFirestore()) {
      try {
        for (const alb of albums) {
          await setDoc(doc(db, 'albums', alb.id), alb, { merge: true });
        }
      } catch {
        markFirestoreOffline();
      }
    }
  }

  // --- FILE UPLOAD (Supports Firebase Storage with seamless IndexedDB Fallback) ---
  static async uploadMedia(
    file: File,
    type: 'image' | 'video' | 'audio',
    onProgress?: (progress: number) => void
  ): Promise<{ url: string; id: string }> {
    const mediaId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const { storage, isConfigured } = getFirebaseInstances();

    if (isConfigured && storage) {
      try {
        return await new Promise((resolve, reject) => {
          const folder = type === 'image' ? 'photos' : type === 'video' ? 'videos' : 'audio';
          const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const storageRef = ref(storage, `${folder}/${mediaId}_${cleanFileName}`);
          const uploadTask = uploadBytesResumable(storageRef, file);

          uploadTask.on(
            'state_changed',
            (snapshot) => {
              if (snapshot.totalBytes > 0) {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) onProgress(Math.round(progress));
              }
            },
            (error) => {
              reject(error);
            },
            async () => {
              try {
                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                if (onProgress) onProgress(100);
                resolve({ url: downloadUrl, id: mediaId });
              } catch (urlErr) {
                reject(urlErr);
              }
            }
          );
        });
      } catch {
        // Seamless fallback to IndexedDB
      }
    }

    // Local IndexedDB Mode with simulated smooth progress feedback
    let progress = 0;
    const interval = setInterval(() => {
      progress = Math.min(progress + 25, 90);
      if (onProgress) onProgress(progress);
    }, 50);

    const objectUrl = await saveMediaBlob(mediaId, file, type, file.name);
    clearInterval(interval);
    if (onProgress) onProgress(100);

    return { url: objectUrl, id: mediaId };
  }

  // --- DEMO PURGE & BULK OPERATIONS ---
  static async clearAllDemoData(): Promise<void> {
    const photos = this.filterOutDemos(await this.getLocalItem<PhotoItem[]>(LS_PHOTOS, []));
    const videos = this.filterOutDemos(await this.getLocalItem<VideoItem[]>(LS_VIDEOS, []));
    const songs = this.filterOutDemos(await this.getLocalItem<SongItem[]>(LS_SONGS, []));
    const memories = this.filterOutDemos(await this.getLocalItem<MemoryItem[]>(LS_MEMORIES, []));

    this.setLocalItem(LS_PHOTOS, photos);
    this.setLocalItem(LS_VIDEOS, videos);
    this.setLocalItem(LS_SONGS, songs);
    this.setLocalItem(LS_MEMORIES, memories);

    // Also purge demo docs from Firestore if configured
    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db && shouldTryFirestore()) {
      try {
        const demoIds = [
          'demo-photo-1', 'demo-photo-2', 'demo-photo-3', 'demo-photo-4', 'demo-photo-5', 'demo-photo-6',
          'demo-video-1', 'demo-video-2',
          'demo-song-1', 'demo-song-2', 'demo-song-3',
          'demo-memory-1', 'demo-memory-2', 'demo-memory-3', 'demo-memory-4'
        ];
        for (const id of demoIds) {
          await deleteDoc(doc(db, 'photos', id)).catch(() => {});
          await deleteDoc(doc(db, 'videos', id)).catch(() => {});
          await deleteDoc(doc(db, 'songs', id)).catch(() => {});
          await deleteDoc(doc(db, 'memories', id)).catch(() => {});
        }
      } catch {
        markFirestoreOffline();
      }
    }

    await this.touchUpdated();
  }

  static async exportBackupJson(): Promise<string> {
    const data = {
      photos: await this.getPhotos(),
      videos: await this.getVideos(),
      songs: await this.getSongs(),
      memories: await this.getMemories(),
      albums: await this.getAlbums(),
      settings: await this.getSettings(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  static async importBackupJson(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (data.photos) this.setLocalItem(LS_PHOTOS, data.photos);
      if (data.videos) this.setLocalItem(LS_VIDEOS, data.videos);
      if (data.songs) this.setLocalItem(LS_SONGS, data.songs);
      if (data.memories) this.setLocalItem(LS_MEMORIES, data.memories);
      if (data.albums) this.setLocalItem(LS_ALBUMS, data.albums);
      if (data.settings) this.setLocalItem(LS_SETTINGS, data.settings);
      await this.touchUpdated();
      return true;
    } catch {
      return false;
    }
  }

  private static async touchUpdated(): Promise<void> {
    const settings = await this.getSettings();
    await this.saveSettings({ ...settings, lastUpdated: Date.now() });
  }
}
