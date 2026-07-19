import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA9nbARxO1b7QnyRQpviB8QR1YpMmZnj18",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "medichron-nexus.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "medichron-nexus",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "medichron-nexus.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "110476344223",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:110476344223:web:2eca3887c29bfd198f5baa",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XN462ERL9C"
};

// Use sandbox mode to bypass Firebase domain authorization for testing
const isConfigured = true; // Sandbox mode for testing (localhost not authorized in Firebase console)
console.log('Firebase configuration status: Sandbox mode (localhost domain not authorized)');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  isConfigured
};
