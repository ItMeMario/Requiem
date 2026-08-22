import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { auth, loginWithGoogleWeb, logoutUser, getFirebaseEnvInfo } from '../utils/auth';

export interface FirebaseEnvInfo {
  isConfigured: boolean;
  isDev: boolean;
  projectId: string;
  authDomain: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isConfigured: boolean;
  envInfo: FirebaseEnvInfo;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isConfigured = !!auth;

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        try {
          const db = getFirestore();
          const userRef = doc(db, 'users', currentUser.uid);
          setDoc(userRef, {
            email: currentUser.email,
            displayName: currentUser.displayName || '',
            photoURL: currentUser.photoURL || ''
          }, { merge: true }).catch((err) => {
            console.error('[AuthContext] Failed to write user profile to Firestore:', err);
          });
        } catch (err) {
          console.error('[AuthContext] Firestore not available yet:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      setLoading(true);
      await loginWithGoogleWeb();
    } catch (error) {
      console.error('[AuthContext] Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Ignore user cancellation errors to avoid showing an alert when users cancel or deny permissions
      if (
        errorMessage.toLowerCase().includes('cancel') ||
        errorMessage.toLowerCase().includes('cancelled')
      ) {
        return;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await logoutUser();
    } catch (error) {
      console.error('[AuthContext] Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const envInfo = getFirebaseEnvInfo();

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isConfigured, envInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
