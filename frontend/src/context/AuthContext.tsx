import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  isConfigured
} from '../firebase';

interface AuthContextType {
  user: any | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isSandbox: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSandbox] = useState<boolean>(!isConfigured);

  useEffect(() => {
    if (!isConfigured) {
      // Sandbox development mode: simulate auto-login if they previously logged in
      const savedMockUser = localStorage.getItem('medichron_mock_user');
      if (savedMockUser) {
        try {
          const parsed = JSON.parse(savedMockUser);
          setUser(parsed);
          setToken('mock-dev-token');
        } catch (e) {
          localStorage.removeItem('medichron_mock_user');
        }
      }
      setLoading(false);
      return;
    }

    // Actual Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);
        } catch (e) {
          console.error('Error fetching Firebase ID token:', e);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (!isConfigured) {
      const mockUser = {
        uid: 'dev-user-123',
        email,
        displayName: email.split('@')[0],
        photoURL: null
      };
      localStorage.setItem('medichron_mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setToken('mock-dev-token');
      return;
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, displayName: string) => {
    if (!isConfigured) {
      const mockUser = {
        uid: 'dev-user-123',
        email,
        displayName,
        photoURL: null
      };
      localStorage.setItem('medichron_mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setToken('mock-dev-token');
      return;
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
      // Update state to trigger rendering immediately
      setUser({ ...userCredential.user, displayName });
      const idToken = await userCredential.user.getIdToken();
      setToken(idToken);
    }
  };

  const loginWithGoogle = async () => {
    if (!isConfigured) {
      const mockUser = {
        uid: 'dev-user-123',
        email: 'google-dev@medichron.ai',
        displayName: 'Google Dev User',
        photoURL: 'https://lh3.googleusercontent.com/a/default-user'
      };
      localStorage.setItem('medichron_mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setToken('mock-dev-token');
      return;
    }
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    if (!isConfigured) {
      localStorage.removeItem('medichron_mock_user');
      setUser(null);
      setToken(null);
      return;
    }
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, loginWithGoogle, logout, isSandbox }}>
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
