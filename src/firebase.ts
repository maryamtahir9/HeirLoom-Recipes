import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Using your custom Firebase setup (heirloom-recipes-7bc6f).
// We have removed the external .json import to fix the Vercel Build Error!
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCUoZUgoRtsKj9Zj18dVgp54B-Y8rgXRXg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "heirloom-recipes-7bc6f.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://heirloom-recipes-7bc6f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "heirloom-recipes-7bc6f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "heirloom-recipes-7bc6f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1018790312518",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1018790312518:web:c6416964a1677a8331e847",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-071DVNSH68"
};

const app = initializeApp(firebaseConfig);
// Initialize Firestore without passing a specific database ID (defaults to your project's main database)
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signIn = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Error signing in with Google: ", error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
  }
};
