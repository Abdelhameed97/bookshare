import { useLanguage } from '../contexts/LanguageContext';
import translations from '../i18n';

const useTranslation = () => {
  const { language } = useLanguage();
  const t = (key) => translations[language][key] || key;
  return { t, language };
};

export default useTranslation; 