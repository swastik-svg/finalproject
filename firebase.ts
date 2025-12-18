import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

/**
 * Robust environment variable access with fallbacks.
 */
const getEnvValue = (key: string, defaultValue: string): string => {
  try {
    const value = (import.meta as any).env?.[key];
    return value || defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const firebaseConfig = {
  apiKey: getEnvValue("VITE_FIREBASE_API_KEY", "AIzaSyBNgp4ZKBq_sHjVC0OGwSidhzCOtoGYR4k"),
  authDomain: getEnvValue("VITE_FIREBASE_AUTH_DOMAIN", "smart-health-dce40.firebaseapp.com"),
  databaseURL: getEnvValue("VITE_FIREBASE_DATABASE_URL", "https://smart-health-dce40-default-rtdb.asia-southeast1.firebasedatabase.app"),
  projectId: getEnvValue("VITE_FIREBASE_PROJECT_ID", "smart-health-dce40"),
  storageBucket: getEnvValue("VITE_FIREBASE_STORAGE_BUCKET", "smart-health-dce40.firebasestorage.app"),
  messagingSenderId: getEnvValue("VITE_FIREBASE_MESSAGING_SENDER_ID", "81529782106"),
  appId: getEnvValue("VITE_FIREBASE_APP_ID", "1:81529782106:web:286029a5dc050cd0423d63"),
  measurementId: getEnvValue("VITE_FIREBASE_MEASUREMENT_ID", "G-CSK81WMJEQ")
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and export it
export const db = getDatabase(app);