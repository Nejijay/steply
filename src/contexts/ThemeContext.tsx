'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Initialize from localStorage to prevent flash
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme;
      if (saved) {
        return saved;
      }
      // Default to light mode for new users
      return 'light';
    }
    return 'light';
  });
  const { user } = useAuth();

  // Load user's theme preference from Firebase
  useEffect(() => {
    if (!user) {
      // Check localStorage first
      const saved = localStorage.getItem('theme') as Theme;
      if (saved) {
        setTheme(saved);
      } else {
        // Default to light mode
        setTheme('light');
      }
      return;
    }

    const loadTheme = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const savedTheme = userData.theme as Theme;
          if (savedTheme) {
            setTheme(savedTheme);
            // Also save to localStorage for faster loading
            localStorage.setItem('theme', savedTheme);
          } else {
            // Default to light mode for new users and save to Firebase
            setTheme('light');
            localStorage.setItem('theme', 'light');
            // Save light theme to Firebase for new users
            await setDoc(doc(db, 'users', user.uid), { theme: 'light' }, { merge: true });
          }
        } else {
          // New user - set and save light theme
          setTheme('light');
          localStorage.setItem('theme', 'light');
          await setDoc(doc(db, 'users', user.uid), { theme: 'light' }, { merge: true });
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };

    loadTheme();
  }, [user]);

  // Apply theme to document and save to Firebase
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    // Save to localStorage immediately for instant persistence
    localStorage.setItem('theme', theme);

    // Save to Firebase if user is logged in
    if (user) {
      setDoc(doc(db, 'users', user.uid), { theme }, { merge: true }).catch((error: any) => {
        console.error('Error saving theme:', error);
      });
    }
  }, [theme, user]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
