import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Your web app's explicit Firebase configuration for Vercel
const firebaseConfig = {
  apiKey: "AIzaSyCUoZUgoRtsKj9Zj18dVgp54B-Y8rgXRXg",
  authDomain: "heirloom-recipes-7bc6f.firebaseapp.com",
  projectId: "heirloom-recipes-7bc6f",
  storageBucket: "heirloom-recipes-7bc6f.firebasestorage.app",
  messagingSenderId: "1018790312518",
  appId: "1:1018790312518:web:c6416964a1677a8331e847",
  measurementId: "G-071DVNSH68"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Authentication Setup
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

// Firestore connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}
testConnection();
