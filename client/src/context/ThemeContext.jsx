import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.setAttribute('data-theme', 'dark');
      root.style.setProperty('--bg', '#0f0f13');
      root.style.setProperty('--bg-card', '#1a1a24');
      root.style.setProperty('--text-primary', '#f0f0f5');
      root.style.setProperty('--text-secondary', '#8b8b9e');
      root.style.setProperty('--border', '#2a2a3a');
      root.style.setProperty('--shadow', '0 4px 20px rgba(0,0,0,0.3)');
      root.style.setProperty('--primary', '#7c74ff');
      document.body.style.background = '#0f0f13';
      document.body.style.color = '#f0f0f5';
      localStorage.setItem('theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
      root.style.setProperty('--bg', '#f8f9fc');
      root.style.setProperty('--bg-card', '#ffffff');
      root.style.setProperty('--text-primary', '#1a1a2e');
      root.style.setProperty('--text-secondary', '#6c757d');
      root.style.setProperty('--border', '#e2e8f0');
      root.style.setProperty('--shadow', '0 4px 20px rgba(0,0,0,0.08)');
      root.style.setProperty('--primary', '#6c63ff');
      document.body.style.background = '#f8f9fc';
      document.body.style.color = '#1a1a2e';
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};