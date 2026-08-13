import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfigJson from '../../firebase-applet-config.json';

const getEnv = (key: string): string | undefined => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return undefined;
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY') || firebaseConfigJson.apiKey,
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN') || firebaseConfigJson.authDomain,
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID') || firebaseConfigJson.projectId,
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET') || firebaseConfigJson.storageBucket,
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || firebaseConfigJson.messagingSenderId,
  appId: getEnv('VITE_FIREBASE_APP_ID') || firebaseConfigJson.appId,
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Services
export const auth = getAuth(app);

// Enable persistent auth session
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Firebase Auth persistence setup warning:', err);
});

// Initialize Firestore with custom database ID if configured
const databaseId = (firebaseConfigJson as any).firestoreDatabaseId;
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export default app;
