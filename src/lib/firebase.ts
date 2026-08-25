import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// User-provided Firebase Configuration for pv-site-d4ccd
export const DEFAULT_FIREBASE_CONFIG: FirebaseClientConfig = {
  apiKey: "AIzaSyDzGEZjuzsj_SayV4FYVQoMP6FTqaRtUxg",
  authDomain: "pv-site-d4ccd.firebaseapp.com",
  projectId: "pv-site-d4ccd",
  storageBucket: "pv-site-d4ccd.firebasestorage.app",
  messagingSenderId: "623823468577",
  appId: "1:623823468577:web:00d17ea0352e8ed5124b60",
  measurementId: "G-ZK1EX62H0L",
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

// Read from environment variables if present, otherwise fallback to user-provided configuration
export const getEnvFirebaseConfig = (): FirebaseClientConfig => {
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (envApiKey && envProjectId && !envApiKey.includes('YOUR_')) {
    return {
      apiKey: envApiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.firebasestorage.app`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
    };
  }

  return DEFAULT_FIREBASE_CONFIG;
};

export function initFirebase(customConfig?: FirebaseClientConfig | null): {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  storage: FirebaseStorage | null;
  isConfigured: boolean;
} {
  const config = customConfig || getEnvFirebaseConfig();

  if (!config || !config.apiKey || !config.projectId || config.apiKey.includes('YOUR_')) {
    return { app: null, auth: null, db: null, storage: null, isConfigured: false };
  }

  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }

    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    return { app, auth, db, storage, isConfigured: true };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return { app: null, auth: null, db: null, storage: null, isConfigured: false };
  }
}

export function getFirebaseInstances() {
  if (!app) {
    return initFirebase();
  }
  return {
    app,
    auth,
    db,
    storage,
    isConfigured: !!(app && db),
  };
}
