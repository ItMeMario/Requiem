import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'medieval' | 'cyberpunk' | 'vampire';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('app-theme') as Theme;
    if (saved === 'medieval' || saved === 'cyberpunk' || saved === 'vampire') {
      return saved;
    }
    return 'medieval';
  });

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    document.documentElement.classList.remove('theme-medieval', 'theme-cyberpunk', 'theme-vampire');
    document.documentElement.classList.add(`theme-${theme}`);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
