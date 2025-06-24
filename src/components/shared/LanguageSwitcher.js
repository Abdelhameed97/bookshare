import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import useTranslation from '../../hooks/useTranslation';

const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();
  const { t } = useTranslation();
  return (
    <button
      onClick={toggleLanguage}
      style={{
        border: '1px solid #d1d5db',
        borderRadius: '22px',
        padding: '6px 18px',
        background: '#fff',
        color: '#23232b',
        fontWeight: 600,
        fontSize: '1rem',
        margin: '0 8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(80,80,160,0.06)'
      }}
      title={language === 'en' ? t('arabic') : t('english')}
    >
      {language === 'en' ? '🌐' : '🌐'}
      {language === 'en' ? t('arabic') : t('english')}
    </button>
  );
};

export default LanguageSwitcher; 