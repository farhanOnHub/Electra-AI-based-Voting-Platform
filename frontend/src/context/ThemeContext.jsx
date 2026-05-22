import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

// Color tone options
const colorTones = {
  blue: {
    primary: '#0ea5e9',
    primaryLight: '#38bdf8',
    primaryDark: '#0284c7',
    gradient: 'from-blue-500 to-blue-600'
  },
  purple: {
    primary: '#8b5cf6',
    primaryLight: '#a78bfa',
    primaryDark: '#7c3aed',
    gradient: 'from-purple-500 to-purple-600'
  },
  green: {
    primary: '#10b981',
    primaryLight: '#34d399',
    primaryDark: '#059669',
    gradient: 'from-green-500 to-green-600'
  },
  orange: {
    primary: '#f97316',
    primaryLight: '#fb923c',
    primaryDark: '#ea580c',
    gradient: 'from-orange-500 to-orange-600'
  },
  pink: {
    primary: '#ec4899',
    primaryLight: '#f472b6',
    primaryDark: '#db2777',
    gradient: 'from-pink-500 to-pink-600'
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [colorTone, setColorTone] = useState(localStorage.getItem('colorTone') || 'blue');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Apply color tone CSS variables
    const root = document.documentElement;
    const tone = colorTones[colorTone];
    if (tone) {
      root.style.setProperty('--primary-color', tone.primary);
      root.style.setProperty('--primary-light', tone.primaryLight);
      root.style.setProperty('--primary-dark', tone.primaryDark);
    }
    localStorage.setItem('colorTone', colorTone);
  }, [colorTone]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const changeColorTone = (tone) => setColorTone(tone);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colorTone, changeColorTone, colorTones }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export default ThemeProvider;
