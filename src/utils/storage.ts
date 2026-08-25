/**
 * Robust IndexedDB client for persistent local storage of media files (Images, Videos, Audio)
 * and metadata backup.
 */

const DB_NAME = 'ForMarthaDB';
const DB_VERSION = 1;
const STORE_MEDIA = 'media_files';
const STORE_DATA = 'app_data';

export interface StoredMedia {
  id: string;
  blob: Blob;
  type: 'image' | 'video' | 'audio';
  name: string;
  mimeType: string;
  createdAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_MEDIA)) {
        db.createObjectStore(STORE_MEDIA, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_DATA)) {
        db.createObjectStore(STORE_DATA, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveMediaBlob(id: string, blob: Blob, type: 'image' | 'video' | 'audio', name: string): Promise<string> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_MEDIA], 'readwrite');
    const store = transaction.objectStore(STORE_MEDIA);

    const record: StoredMedia = {
      id,
      blob,
      type,
      name,
      mimeType: blob.type,
      createdAt: Date.now(),
    };

    await new Promise<void>((resolve, reject) => {
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    // Return object URL for instant rendering
    return URL.createObjectURL(blob);
  } catch (error) {
    console.warn('Failed to save to IndexedDB, fallback to Data URL', error);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }
}

export async function getMediaBlobUrl(id: string): Promise<string | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_MEDIA], 'readonly');
    const store = transaction.objectStore(STORE_MEDIA);

    const record = await new Promise<StoredMedia | undefined>((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (record && record.blob) {
      return URL.createObjectURL(record.blob);
    }
    return null;
  } catch (error) {
    console.warn('Could not retrieve media blob from IndexedDB', error);
    return null;
  }
}

export async function deleteMediaBlob(id: string): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_MEDIA], 'readwrite');
    const store = transaction.objectStore(STORE_MEDIA);

    await new Promise<void>((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.warn('Error deleting media blob from IndexedDB', error);
  }
}

export async function clearAllLocalMedia(): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_MEDIA], 'readwrite');
    const store = transaction.objectStore(STORE_MEDIA);
    await new Promise<void>((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.warn('Error clearing local media', error);
  }
}
