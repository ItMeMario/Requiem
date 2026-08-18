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
export const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

export function getFirebaseEnvInfo() {
  const isDev = import.meta.env.DEV || firebaseConfig.projectId === 'requiem-dev';
  return {
    isConfigured: isFirebaseConfigured,
    isDev,
    projectId: firebaseConfig.projectId || 'Local / Offline',
    authDomain: firebaseConfig.authDomain || 'N/A'
  };
}

let app;
let auth: ReturnType<typeof getAuth> | null = null;

if (isFirebaseConfigured) {
  try {
    const isDev = import.meta.env.DEV || firebaseConfig.projectId === 'requiem-dev';
    console.log(
      `%c[Requiem]%c 🛡️ Firebase Initialized: %c${isDev ? 'DEVELOPMENT (requiem-dev)' : 'PRODUCTION (requiem-4886d)'}%c | Auth: %cActive`,
      'background: #1e1e2e; color: #00ffff; font-weight: bold; padding: 3px 6px; border-radius: 4px;',
      'color: #aaa;',
      `color: ${isDev ? '#f59e0b' : '#10b981'}; font-weight: bold;`,
      'color: #aaa;',
      'color: #00ffff; font-weight: bold;'
    );
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (error) {
    console.error('[Requiem Auth] Failed to initialize Firebase:', error);
  }
} else {
  console.log(
    '%c[Requiem]%c 💾 Running in %cLOCAL-ONLY / OFFLINE%c mode (No Firebase credentials).',
    'background: #1e1e2e; color: #00ffff; font-weight: bold; padding: 3px 6px; border-radius: 4px;',
    'color: #aaa;',
    'color: #a78bfa; font-weight: bold;',
    'color: #aaa;'
  );
}

export { auth };

let isGoogleSignInInitialized = false;

async function ensureGoogleSignInInitialized() {
  if (isGoogleSignInInitialized) return;
  if (!Capacitor.isNativePlatform()) return;

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID_WEB;
  if (!clientId || clientId.startsWith('your_')) {
    throw new Error('Google Web Client ID is not configured in .env file.');
  }

  try {
    await GoogleSignIn.initialize({ clientId });
    isGoogleSignInInitialized = true;
  } catch (err: any) {
    console.warn('[Requiem Auth] GoogleSignIn.initialize failed:', err);
    // Assume it is already initialized if it threw an error
    isGoogleSignInInitialized = true;
  }
}

export async function loginWithGoogleWeb(): Promise<User | null> {
  if (!auth) {
    throw new Error('Firebase Auth is not configured. Please check your environment variables.');
  }

  // 1. Mobile Native Flow (Capacitor)
  if (Capacitor.isNativePlatform()) {
    await ensureGoogleSignInInitialized();
    const result = await GoogleSignIn.signIn();
    const idToken = result.idToken;
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
      await ensureGoogleSignInInitialized();
      await GoogleSignIn.signOut();
    } catch (err) {
      console.warn('[Requiem Auth] Native Google sign out failed, continuing sign out:', err);
    }
  }
  
  await signOut(auth);
}

