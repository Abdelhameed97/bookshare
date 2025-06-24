import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useTranslation from '../../hooks/useTranslation';

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  return (
    <button
      onClick={toggleTheme}
      style={{
        border: '1px solid #d1d5db',
        borderRadius: '22px',
        padding: '6px 18px',
        background: theme === 'dark' ? '#23232b' : '#fff',
        color: theme === 'dark' ? '#fff' : '#23232b',
        fontWeight: 600,
        fontSize: '1rem',
        margin: '0 8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(80,80,160,0.06)'
      }}
      title={theme === 'light' ? t('dark') : t('light')}
    >
      {theme === 'light' ? '🌙' : '☀️'}
      {theme === 'light' ? t('dark') : t('light')}
    </button>
  );
};

export default ThemeSwitcher; 