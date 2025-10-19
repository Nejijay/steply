'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { PinVerification } from '@/components/PinVerification';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  pinVerified: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  pinVerified: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pinVerified, setPinVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Check if PIN is required
  const requiresPin = typeof window !== 'undefined' && localStorage.getItem('appPin');

  // If PIN is required and not verified, show PIN screen
  if (requiresPin && !pinVerified && !loading) {
    return <PinVerification onVerified={() => setPinVerified(true)} />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, pinVerified }}>
      {children}
    </AuthContext.Provider>
  );
};
