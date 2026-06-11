import React, { createContext, useState } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(true); // 👈 ISSO RESOLVE

  const toggleTheme = () => setDark(prev => !prev);

  const theme = {
  dark,
  colors: dark
    ? {
        background: '#0b1117',
        text: '#ffffff',
        card: '#111827',
        subText: '#9ca3af',

        primary: '#22c55e',
        danger: '#ef4444',
        highlight: '#7c3aed'
      }
    : {
        background: '#f5f5f5',
        text: '#111111',
        card: '#ffffff',
        subText: '#555555',

        // 🔥 ADICIONA ISSO AQUI
        primary: '#22c55e',
        danger: '#ef4444',
        highlight: '#7c3aed'
      }
};

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}