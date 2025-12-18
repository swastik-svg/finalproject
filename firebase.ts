
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Function to safely get environment variables
const getEnv = (key: string, fallback: string): string => {
  try {
    // Check if process and process.env exist (some build tools provide this)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
    // Check if import.meta.env exists (Vite/ESM style)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[`VITE_${key}`]) {
      // @ts-ignore
      return import.meta.env[`VITE_${key}`] as string;
    }
  } catch (e) {
    // Silently fail and use fallback
  }
  return fallback;
};

const firebaseConfig = {
  apiKey: getEnv('FIREBASE_API_KEY', "AIzaSyBNgp4ZKBq_sHjVC0OGwSidhzCOtoGYR4k"),
  authDomain: getEnv('FIREBASE_AUTH_DOMAIN', "smart-health-dce40.firebaseapp.com"),
  databaseURL: getEnv('FIREBASE_DATABASE_URL', "https://smart-health-dce40-default-rtdb.asia-southeast1.firebasedatabase.app"),
  projectId: getEnv('FIREBASE_PROJECT_ID', "smart-health-dce40"),
  storageBucket: getEnv('FIREBASE_STORAGE_BUCKET', "smart-health-dce40.firebasestorage.app"),
  messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID', "81529782106"),
  appId: getEnv('FIREBASE_APP_ID', "1:81529782106:web:286029a5dc050cd0423d63"),
  measurementId: getEnv('FIREBASE_MEASUREMENT_ID', "G-CSK81WMJEQ")
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and export it
export const db = getDatabase(app);
