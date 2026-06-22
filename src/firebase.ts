import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseAppletConfig from '../firebase-applet-config.json';

// Allow Vercel or other platforms' environment variables to override the config
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
  appId: process.env.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseAppletConfig.measurementId,
  firestoreDatabaseId: process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || firebaseAppletConfig.firestoreDatabaseId || '(default)'
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signIn = () => signInWithPopup(auth, googleProvider);
export const logOut = () => signOut(auth);

// Connection test
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
