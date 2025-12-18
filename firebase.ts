
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Function to safely get environment variables for Vite/Vercel
const getEnv = (key: string, fallback: string): string => {
  // Vite uses import.meta.env for environment variables
  // Vercel UI handles these if you add them in Project Settings -> Environment Variables
  const viteKey = `VITE_${key}`;
  // @ts-ignore
  if (import.meta.env && import.meta.env[viteKey]) {
    // @ts-ignore
    return import.meta.env[viteKey];
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
