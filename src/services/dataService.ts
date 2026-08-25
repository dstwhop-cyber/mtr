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
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
    }
  }

  // --- SETTINGS & CONFIG ---
  static async getSettings(): Promise<AppSettings> {
    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db) {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'global'));
        if (docSnap.exists()) {
          return { ...DEFAULT_SETTINGS, ...docSnap.data() } as AppSettings;
        }
      } catch (err) {
        console.warn('Firestore settings fetch error, using local/cached:', err);
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
    return localSettings;
  }

  static async saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated: AppSettings = {
      ...current,
      ...settings,
      lastUpdated: Date.now(),
    };

    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db) {
      try {
        await setDoc(doc(db, 'settings', 'global'), updated, { merge: true });
      } catch (err) {
        console.error('Firestore settings save error:', err);
      }
    }

    this.setLocalItem(LS_SETTINGS, updated);
    return updated;
  }

  // --- PHOTOS ---
  static async getPhotos(): Promise<PhotoItem[]> {
    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'photos'));
        const list: PhotoItem[] = [];
        querySnapshot.forEach((doc) => list.push({ ...doc.data(), id: doc.id } as PhotoItem));
        if (list.length > 0) {
          list.sort((a, b) => b.createdAt - a.createdAt);
          return list;
        }
      } catch (err) {
        console.warn('Firestore photos fetch error, falling back to local:', err);
      }
    }

    const photos = await this.getLocalItem<PhotoItem[]>(LS_PHOTOS, INITIAL_PHOTOS);
    // Refresh any IndexedDB blob URLs if needed
    for (const photo of photos) {
      if (photo.url.startsWith('indexeddb://')) {
        const id = photo.url.replace('indexeddb://', '');
        const blobUrl = await getMediaBlobUrl(id);
        if (blobUrl) photo.url = blobUrl;
      }
    }
    return photos;
  }

  static async addPhoto(photo: Omit<PhotoItem, 'id' | 'createdAt'>): Promise<PhotoItem> {
    const id = 'photo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newPhoto: PhotoItem = {
      ...photo,
      id,
      createdAt: Date.now(),
    };

    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db) {
      try {
        await setDoc(doc(db, 'photos', id), newPhoto);
      } catch (err) {
        console.error('Firestore save photo error:', err);
      }
    }

    const current = await this.getLocalItem<PhotoItem[]>(LS_PHOTOS, INITIAL_PHOTOS);
    const updated = [newPhoto, ...current];
    this.setLocalItem(LS_PHOTOS, updated);
    await this.touchUpdated();
    return newPhoto;
  }

  static async updatePhoto(id: string, updates: Partial<PhotoItem>): Promise<void> {
    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db) {
      try {
        await updateDoc(doc(db, 'photos', id), updates);
      } catch (err) {
        console.error('Firestore update photo error:', err);
      }
    }

    const current = await this.getLocalItem<PhotoItem[]>(LS_PHOTOS, INITIAL_PHOTOS);
    const updated = current.map((item) => (item.id === id ? { ...item, ...updates } : item));
    this.setLocalItem(LS_PHOTOS, updated);
    await this.touchUpdated();
  }

  static async deletePhoto(id: string): Promise<void> {
    const { db, storage, isConfigured } = getFirebaseInstances();
    if (isConfigured && db) {
      try {
        await deleteDoc(doc(db, 'photos', id));
        if (storage) {
          const fileRef = ref(storage, `photos/${id}`);
          await deleteObject(fileRef).catch(() => {});
        }
      } catch (err) {
        console.error('Firestore delete photo error:', err);
      }
    }

    await deleteMediaBlob(id);
    const current = await this.getLocalItem<PhotoItem[]>(LS_PHOTOS, INITIAL_PHOTOS);
    const updated = current.filter((item) => item.id !== id);
    this.setLocalItem(LS_PHOTOS, updated);
    await this.touchUpdated();
  }

  // --- VIDEOS ---
  static async getVideos(): Promise<VideoItem[]> {
    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'videos'));
        const list: VideoItem[] = [];
        querySnapshot.forEach((doc) => list.push({ ...doc.data(), id: doc.id } as VideoItem));
        if (list.length > 0) {
          list.sort((a, b) => b.createdAt - a.createdAt);
          return list;
        }
      } catch (err) {
        console.warn('Firestore videos fetch error:', err);
      }
    }

    const videos = await this.getLocalItem<VideoItem[]>(LS_VIDEOS, INITIAL_VIDEOS);
    for (const vid of videos) {
      if (vid.url.startsWith('indexeddb://')) {
        const id = vid.url.replace('indexeddb://', '');
        const blobUrl = await getMediaBlobUrl(id);
        if (blobUrl) vid.url = blobUrl;
      }
    }
    return videos;
  }

  static async addVideo(video: Omit<VideoItem, 'id' | 'createdAt'>): Promise<VideoItem> {
    const id = 'video_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newVideo: VideoItem = {
      ...video,
      id,
      createdAt: Date.now(),
    };

    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db) {
      try {
        await setDoc(doc(db, 'videos', id), newVideo);
      } catch (err) {
        console.error('Firestore add video error:', err);
      }
    }

    const current = await this.getLocalItem<VideoItem[]>(LS_VIDEOS, INITIAL_VIDEOS);
    const updated = [newVideo, ...current];
    this.setLocalItem(LS_VIDEOS, updated);
    await this.touchUpdated();
    return newVideo;
  }

  static async deleteVideo(id: string): Promise<void> {
    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db) {
      try {
        await deleteDoc(doc(db, 'videos', id));
      } catch (err) {
        console.error('Firestore delete video error:', err);
      }
    }

    await deleteMediaBlob(id);
    const current = await this.getLocalItem<VideoItem[]>(LS_VIDEOS, INITIAL_VIDEOS);
    const updated = current.filter((item) => item.id !== id);
    this.setLocalItem(LS_VIDEOS, updated);
    await this.touchUpdated();
  }

  // --- SONGS / MUSIC ---
  static async getSongs(): Promise<SongItem[]> {
    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'songs'));
        const list: SongItem[] = [];
        querySnapshot.forEach((doc) => list.push({ ...doc.data(), id: doc.id } as SongItem));
        if (list.length > 0) {
          list.sort((a, b) => a.order - b.order);
          return list;
        }
      } catch (err) {
        console.warn('Firestore songs fetch error:', err);
      }
    }

    const songs = await this.getLocalItem<SongItem[]>(LS_SONGS, INITIAL_SONGS);
    for (const song of songs) {
      if (song.url.startsWith('indexeddb://')) {
        const id = song.url.replace('indexeddb://', '');
        const blobUrl = await getMediaBlobUrl(id);
        if (blobUrl) song.url = blobUrl;
      }
    }
    return songs;
  }

  static async addSong(song: Omit<SongItem, 'id' | 'createdAt'>): Promise<SongItem> {
    const id = 'song_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const current = await this.getLocalItem<SongItem[]>(LS_SONGS, INITIAL_SONGS);
    const newSong: SongItem = {
      ...song,
      id,
      order: song.order ?? current.length,
      createdAt: Date.now(),
    };

    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db) {
      try {
        await setDoc(doc(db, 'songs', id), newSong);
      } catch (err) {
        console.error('Firestore add song error:', err);
      }
    }

    const updated = [...current, newSong];
    this.setLocalItem(LS_SONGS, updated);
    await this.touchUpdated();
    return newSong;
  }

  static async updateSong(id: string, updates: Partial<SongItem>): Promise<void> {
    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db) {
      try {
        await updateDoc(doc(db, 'songs', id), updates);
      } catch (err) {
        console.error('Firestore update song error:', err);
      }
    }

    const current = await this.getLocalItem<SongItem[]>(LS_SONGS, INITIAL_SONGS);
    const updated = current.map((s) => (s.id === id ? { ...s, ...updates } : s));
    this.setLocalItem(LS_SONGS, updated);
    await this.touchUpdated();
  }

  static async deleteSong(id: string): Promise<void> {
    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db) {
      try {
        await deleteDoc(doc(db, 'songs', id));
      } catch (err) {
        console.error('Firestore delete song error:', err);
      }
    }

    await deleteMediaBlob(id);
    const current = await this.getLocalItem<SongItem[]>(LS_SONGS, INITIAL_SONGS);
    const updated = current.filter((s) => s.id !== id);
    this.setLocalItem(LS_SONGS, updated);
    await this.touchUpdated();
  }

  // --- MEMORIES / TIMELINE ---
  static async getMemories(): Promise<MemoryItem[]> {
    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'memories'));
        const list: MemoryItem[] = [];
        querySnapshot.forEach((doc) => list.push({ ...doc.data(), id: doc.id } as MemoryItem));
        if (list.length > 0) {
          list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          return list;
        }
      } catch (err) {
        console.warn('Firestore memories fetch error:', err);
      }
    }

    const memories = await this.getLocalItem<MemoryItem[]>(LS_MEMORIES, INITIAL_MEMORIES);
    for (const mem of memories) {
      if (mem.photoUrl && mem.photoUrl.startsWith('indexeddb://')) {
        const id = mem.photoUrl.replace('indexeddb://', '');
        const blobUrl = await getMediaBlobUrl(id);
        if (blobUrl) mem.photoUrl = blobUrl;
      }
    }
    return memories.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async addMemory(memory: Omit<MemoryItem, 'id' | 'createdAt'>): Promise<MemoryItem> {
    const id = 'memory_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newMemory: MemoryItem = {
      ...memory,
      id,
      createdAt: Date.now(),
    };

    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db) {
      try {
        await setDoc(doc(db, 'memories', id), newMemory);
      } catch (err) {
        console.error('Firestore add memory error:', err);
      }
    }

    const current = await this.getLocalItem<MemoryItem[]>(LS_MEMORIES, INITIAL_MEMORIES);
    const updated = [newMemory, ...current];
    this.setLocalItem(LS_MEMORIES, updated);
    await this.touchUpdated();
    return newMemory;
  }

  static async updateMemory(id: string, updates: Partial<MemoryItem>): Promise<void> {
    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db) {
      try {
        await updateDoc(doc(db, 'memories', id), updates);
      } catch (err) {
        console.error('Firestore update memory error:', err);
      }
    }

    const current = await this.getLocalItem<MemoryItem[]>(LS_MEMORIES, INITIAL_MEMORIES);
    const updated = current.map((m) => (m.id === id ? { ...m, ...updates } : m));
    this.setLocalItem(LS_MEMORIES, updated);
    await this.touchUpdated();
  }

  static async deleteMemory(id: string): Promise<void> {
    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db) {
      try {
        await deleteDoc(doc(db, 'memories', id));
      } catch (err) {
        console.error('Firestore delete memory error:', err);
      }
    }

    const current = await this.getLocalItem<MemoryItem[]>(LS_MEMORIES, INITIAL_MEMORIES);
    const updated = current.filter((m) => m.id !== id);
    this.setLocalItem(LS_MEMORIES, updated);
    await this.touchUpdated();
  }

  // --- ALBUMS ---
  static async getAlbums(): Promise<AlbumItem[]> {
    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'albums'));
        const list: AlbumItem[] = [];
        querySnapshot.forEach((doc) => list.push({ ...doc.data(), id: doc.id } as AlbumItem));
        if (list.length > 0) return list;
      } catch (err) {
        console.warn('Firestore albums fetch error:', err);
      }
    }
    return this.getLocalItem<AlbumItem[]>(LS_ALBUMS, INITIAL_ALBUMS);
  }

  static async saveAlbums(albums: AlbumItem[]): Promise<void> {
    this.setLocalItem(LS_ALBUMS, albums);
    const { db, isConfigured } = getFirebaseInstances();
    if (isConfigured && db) {
      try {
        for (const alb of albums) {
          await setDoc(doc(db, 'albums', alb.id), alb, { merge: true });
        }
      } catch (err) {
        console.error('Firestore save albums error:', err);
      }
    }
  }

  // --- FILE UPLOAD (Supports Firebase Storage & IndexedDB) ---
  static async uploadMedia(
    file: File,
    type: 'image' | 'video' | 'audio',
    onProgress?: (progress: number) => void
  ): Promise<{ url: string; id: string }> {
    const mediaId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const { storage, isConfigured } = getFirebaseInstances();

    if (isConfigured && storage) {
      return new Promise((resolve, reject) => {
        const folder = type === 'image' ? 'photos' : type === 'video' ? 'videos' : 'audio';
        const storageRef = ref(storage, `${folder}/${mediaId}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) onProgress(Math.round(progress));
          },
          (error) => {
            console.error('Firebase Storage upload error:', error);
            reject(error);
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) onProgress(100);
            resolve({ url: downloadUrl, id: mediaId });
          }
        );
      });
    }

    // Local IndexedDB Mode with simulated smooth progress
    let progress = 0;
    const interval = setInterval(() => {
      progress = Math.min(progress + 25, 90);
      if (onProgress) onProgress(progress);
    }, 60);

    const objectUrl = await saveMediaBlob(mediaId, file, type, file.name);
    clearInterval(interval);
    if (onProgress) onProgress(100);

    return { url: objectUrl, id: mediaId };
  }

  // --- DEMO RESET & BULK OPERATIONS ---
  static async resetToDemoData(): Promise<void> {
    this.setLocalItem(LS_PHOTOS, INITIAL_PHOTOS);
    this.setLocalItem(LS_VIDEOS, INITIAL_VIDEOS);
    this.setLocalItem(LS_SONGS, INITIAL_SONGS);
    this.setLocalItem(LS_MEMORIES, INITIAL_MEMORIES);
    this.setLocalItem(LS_ALBUMS, INITIAL_ALBUMS);
    await this.touchUpdated();
  }

  static async clearAllDemoData(): Promise<void> {
    const photos = (await this.getLocalItem<PhotoItem[]>(LS_PHOTOS, INITIAL_PHOTOS)).filter((p) => !p.isDemo);
    const videos = (await this.getLocalItem<VideoItem[]>(LS_VIDEOS, INITIAL_VIDEOS)).filter((v) => !v.isDemo);
    const songs = (await this.getLocalItem<SongItem[]>(LS_SONGS, INITIAL_SONGS)).filter((s) => !s.isDemo);
    const memories = (await this.getLocalItem<MemoryItem[]>(LS_MEMORIES, INITIAL_MEMORIES)).filter((m) => !m.isDemo);

    this.setLocalItem(LS_PHOTOS, photos);
    this.setLocalItem(LS_VIDEOS, videos);
    this.setLocalItem(LS_SONGS, songs);
    this.setLocalItem(LS_MEMORIES, memories);
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
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  }

  private static async touchUpdated(): Promise<void> {
    const settings = await this.getSettings();
    await this.saveSettings({ ...settings, lastUpdated: Date.now() });
  }
}
