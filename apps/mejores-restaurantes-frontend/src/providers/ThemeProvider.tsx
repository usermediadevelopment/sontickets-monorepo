'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { isSystemDarkTheme, getThemeFromStorage, setThemeInStorage, type Theme } from '@/lib/utils';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // Initialize theme from storage or system preference
  useEffect(() => {
    const savedTheme = getThemeFromStorage();
    setTheme(savedTheme);
  }, []);

  // Update theme in storage when it changes
  useEffect(() => {
    setThemeInStorage(theme);
    
    // Determine if dark mode should be active
    if (theme === 'system') {
      setIsDarkTheme(isSystemDarkTheme());
    } else {
      setIsDarkTheme(theme === 'dark');
    }
  }, [theme]);

  // Handle system preference changes
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      setIsDarkTheme(mediaQuery.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Apply dark mode class to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkTheme);
  }, [isDarkTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 