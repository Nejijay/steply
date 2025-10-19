'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type ThemeColor = 'purple' | 'blue' | 'green' | 'pink' | 'orange' | 'red' | 'black';

interface ThemeColorContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

const ThemeColorContext = createContext<ThemeColorContextType | undefined>(undefined);

export const themeColors = {
  purple: {
    primary: 'from-purple-500 to-pink-600',
    bg: 'bg-purple-600',
    text: 'text-purple-600',
    hover: 'hover:bg-purple-700',
    light: 'bg-purple-50 dark:bg-purple-900/20',
  },
  blue: {
    primary: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-600',
    text: 'text-blue-600',
    hover: 'hover:bg-blue-700',
    light: 'bg-blue-50 dark:bg-blue-900/20',
  },
  green: {
    primary: 'from-green-500 to-emerald-600',
    bg: 'bg-green-600',
    text: 'text-green-600',
    hover: 'hover:bg-green-700',
    light: 'bg-green-50 dark:bg-green-900/20',
  },
  pink: {
    primary: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-600',
    text: 'text-pink-600',
    hover: 'hover:bg-pink-700',
    light: 'bg-pink-50 dark:bg-pink-900/20',
  },
  orange: {
    primary: 'from-orange-500 to-amber-600',
    bg: 'bg-orange-600',
    text: 'text-orange-600',
    hover: 'hover:bg-orange-700',
    light: 'bg-orange-50 dark:bg-orange-900/20',
  },
  red: {
    primary: 'from-red-500 to-pink-600',
    bg: 'bg-red-600',
    text: 'text-red-600',
    hover: 'hover:bg-red-700',
    light: 'bg-red-50 dark:bg-red-900/20',
  },
  black: {
    primary: 'from-gray-900 to-gray-700',
    bg: 'bg-gray-900',
    text: 'text-gray-900',
    hover: 'hover:bg-gray-800',
    light: 'bg-gray-50 dark:bg-gray-800',
  },
};

export function ThemeColorProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColorState] = useState<ThemeColor>(() => {
    // Initialize from localStorage to prevent flash
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme-color') as ThemeColor;
      if (saved && themeColors[saved]) {
        return saved;
      }
    }
    return 'purple';
  });
  const { user } = useAuth();

  // Load user's theme color from Firebase
  useEffect(() => {
    if (!user) {
      // Check localStorage for non-logged in users
      const saved = localStorage.getItem('theme-color') as ThemeColor;
      if (saved && themeColors[saved]) {
        setThemeColorState(saved);
      }
      return;
    }

    const loadThemeColor = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const savedColor = userData.themeColor as ThemeColor;
          if (savedColor && themeColors[savedColor]) {
            setThemeColorState(savedColor);
            // Also save to localStorage for faster loading
            localStorage.setItem('theme-color', savedColor);
          }
        }
      } catch (error) {
        console.error('Error loading theme color:', error);
      }
    };

    loadThemeColor();
  }, [user]);

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
    
    // Apply theme color to document
    document.documentElement.setAttribute('data-theme-color', color);
    
    // Save to localStorage immediately for instant persistence
    localStorage.setItem('theme-color', color);
    
    // Save to Firebase if user is logged in
    if (user) {
      setDoc(doc(db, 'users', user.uid), { themeColor: color }, { merge: true }).catch((error: any) => {
        console.error('Error saving theme color:', error);
      });
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme-color', themeColor);
  }, [themeColor]);

  return (
    <ThemeColorContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </ThemeColorContext.Provider>
  );
}

export function useThemeColor() {
  const context = useContext(ThemeColorContext);
  if (context === undefined) {
    throw new Error('useThemeColor must be used within a ThemeColorProvider');
  }
  return context;
}
