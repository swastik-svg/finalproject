import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

/**
 * Safe access to environment variables.
 * Vite injects these during the build process.
 */
const getEnv = (key: string, fallback: string): string => {
  const env = (import.meta as any).env;
  return (env && env[key]) ? env[key] : fallback;
};

const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY", "AIzaSyBNgp4ZKBq_sHjVC0OGwSidhzCOtoGYR4k"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN", "smart-health-dce40.firebaseapp.com"),
  databaseURL: getEnv("VITE_FIREBASE_DATABASE_URL", "https://smart-health-dce40-default-rtdb.asia-southeast1.firebasedatabase.app"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID", "smart-health-dce40"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET", "smart-health-dce40.firebasestorage.app"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "81529782106"),
  appId: getEnv("VITE_FIREBASE_APP_ID", "1:81529782106:web:286029a5dc050cd0423d63"),
  measurementId: getEnv("VITE_FIREBASE_MEASUREMENT_ID", "G-CSK81WMJEQ")
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and export it
export const db = getDatabase(app);