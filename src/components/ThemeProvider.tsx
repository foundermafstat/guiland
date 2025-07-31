'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
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

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeType, setThemeType] = useState<ThemeType>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeType;
    if (savedTheme) {
      setThemeType(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = themeType === 'light' ? 'dark' : 'light';
    setThemeType(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const antdTheme = {
    algorithm: themeType === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#667eea',
      borderRadius: 8,
    },
  };

  return (
    <ThemeContext.Provider value={{ theme: themeType, toggleTheme }}>
      <ConfigProvider theme={antdTheme}>
        <div className={themeType}>
          {children}
        </div>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}; 