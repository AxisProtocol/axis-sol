'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ThemeSwitcherProps {
  size?: 'sm' | 'md';
  className?: string;
}

const ThemeSwitcher = ({ size = 'md', className = '' }: ThemeSwitcherProps) => {
  const [currentTheme, setCurrentTheme] = useState('axis-dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'axis-dark';
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleThemeChange = (themeId: 'axis-dark' | 'axis-light') => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('theme', themeId);
  };

  const isMyTheme = currentTheme === 'axis-dark';

  const buttonSize = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const padSize = size === 'sm' ? 'p-0.5' : 'p-1';

  return (
    <div className={`inline-flex items-center rounded-xl border border-base-300 bg-base-100 ${padSize} ${className}`}>
      <motion.button
        aria-label="Use axis-dark"
        onClick={() => handleThemeChange('axis-dark')}
        className={`${buttonSize} rounded-lg flex items-center justify-center transition-all ${
          isMyTheme
            ? 'bg-primary/10 text-primary border border-primary/40 shadow-sm'
            : 'text-base-content/70 hover:text-base-content hover:bg-base-200 border border-transparent'
        }`}
        whileTap={{ scale: 0.96 }}
      >
        {/* Custom star/spark icon */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={iconSize} fill="currentColor">
          <path d="M12 2.75c.35 0 .68.2.84.52l1.9 3.86c.1.2.27.36.48.45l4.11 1.68c.87.36.87 1.62 0 1.98l-4.11 1.68c-.21.09-.38.25-.48.45l-1.9 3.86a.93.93 0 0 1-1.68 0l-1.9-3.86a1 1 0 0 0-.48-.45L4.5 11.24a1.06 1.06 0 0 1 0-1.98l4.11-1.68c.21-.09.38-.25.48-.45l1.9-3.86c.16-.32.49-.52.84-.52Z"/>
        </svg>
      </motion.button>

      <motion.button
        aria-label="Use axis-light"
        onClick={() => handleThemeChange('axis-light')}
        className={`${buttonSize} rounded-lg flex items-center justify-center transition-all ml-1 ${
          !isMyTheme
            ? 'bg-primary/10 text-primary border border-primary/40 shadow-sm'
            : 'text-base-content/70 hover:text-base-content hover:bg-base-200 border border-transparent'
        }`}
        whileTap={{ scale: 0.96 }}
      >
        {/* Sun icon */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={iconSize} fill="currentColor">
          <path d="M12 5.25a.75.75 0 0 0 .75-.75V2.75a.75.75 0 0 0-1.5 0V4.5c0 .41.34.75.75.75Zm0 16.5a.75.75 0 0 0-.75.75v1.75a.75.75 0 0 0 1.5 0V22.5a.75.75 0 0 0-.75-.75Zm9-9a.75.75 0 0 0 .75-.75h1.75a.75.75 0 0 0 0-1.5H21.75a.75.75 0 0 0-.75.75c0 .41.34.75.75.75ZM2.25 12a.75.75 0 0 0 .75.75H4.75a.75.75 0 0 0 0-1.5H3a.75.75 0 0 0-.75.75Zm15.72 6.03a.75.75 0 1 0-1.06 1.06l1.24 1.24a.75.75 0 1 0 1.06-1.06l-1.24-1.24Zm-11.88-12.3a.75.75 0 1 0 1.06-1.06L5.91 3.43a.75.75 0 0 0-1.06 1.06l1.24 1.24Zm12.3-1.24-1.24 1.24a.75.75 0 1 0 1.06 1.06l1.24-1.24a.75.75 0 1 0-1.06-1.06ZM4.21 18.03l1.24-1.24a.75.75 0 0 0-1.06-1.06l-1.24 1.24a.75.75 0 1 0 1.06 1.06ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"/>
        </svg>
      </motion.button>
    </div>
  );
};

export default ThemeSwitcher;
