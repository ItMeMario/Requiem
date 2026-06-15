import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithCredential, signOut, User } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if we have at least apiKey and projectId to initialize Firebase
const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

let app;
let auth: ReturnType<typeof getAuth> | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (error) {
    console.error('[Requiem Auth] Failed to initialize Firebase:', error);
  }
} else {
  console.warn('[Requiem Auth] Firebase credentials are not configured. Running in local-only mode.');
}

export { auth };

export async function loginWithGoogleWeb(): Promise<User | null> {
  if (!auth) {
    throw new Error('Firebase Auth is not configured. Please check your environment variables.');
  }

  // 1. Mobile Native Flow (Capacitor)
  if (Capacitor.isNativePlatform()) {
    const result = await GoogleSignIn.signIn();
    const idToken = result.user?.idToken;
    if (!idToken) {
      throw new Error('Failed to retrieve Google ID Token.');
    }
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential.user;
  }

  // 2. Desktop Flow (Electron Loopback)
  if (typeof window !== 'undefined' && (window as any).api && (window as any).api.googleSignIn) {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID_WEB;
    if (!clientId || clientId.startsWith('your_')) {
      throw new Error('Google Web Client ID is not configured in .env file.');
    }
    const idToken = await (window as any).api.googleSignIn(clientId);
    if (!idToken) {
      throw new Error('Failed to retrieve Google ID Token from desktop login.');
    }
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential.user;
  }

  // 3. Web Flow (Fallback)
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function logoutUser(): Promise<void> {
  if (!auth) return;
  
  if (Capacitor.isNativePlatform()) {
    try {
      await GoogleSignIn.signOut();
    } catch (err) {
      console.warn('[Requiem Auth] Native Google sign out failed, continuing sign out:', err);
    }
  }
  
  await signOut(auth);
}

