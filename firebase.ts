
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Firebase configuration using environment variables for Vercel.
// You can set these keys in Vercel Project Settings -> Environment Variables.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyBNgp4ZKBq_sHjVC0OGwSidhzCOtoGYR4k",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "smart-health-dce40.firebaseapp.com",
  databaseURL: process.env.FIREBASE_DATABASE_URL || "https://smart-health-dce40-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: process.env.FIREBASE_PROJECT_ID || "smart-health-dce40",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "smart-health-dce40.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "81529782106",
  appId: process.env.FIREBASE_APP_ID || "1:81529782106:web:286029a5dc050cd0423d63",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-CSK81WMJEQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and export it
export const db = getDatabase(app);
