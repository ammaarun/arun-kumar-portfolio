import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [adminTheme, setAdminTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ak_portfolio_theme') || 'dark';
    }
    return 'dark';
  });

  const [visitorOverride, setVisitorOverride] = useState(null);

  const toggleAdminTheme = () => {
    setAdminTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('ak_portfolio_theme', next);
      }
      return next;
    });
  };

  const toggleVisitorTheme = (currentActiveTheme = 'dark') => {
    setVisitorOverride(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'light';
      return currentActiveTheme === 'light' ? 'dark' : 'light';
    });
  };

  const resetVisitorOverride = () => {
    setVisitorOverride(null);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme: adminTheme, 
      toggleTheme: toggleAdminTheme, 
      setTheme: setAdminTheme,
      visitorOverride,
      toggleVisitorTheme,
      resetVisitorOverride
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
