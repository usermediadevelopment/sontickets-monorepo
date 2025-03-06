import { useEffect } from 'react';
import useGetParam from './useGetParam';
import { useTranslation } from 'react-i18next';

const useLang = () => {
  const lang = useGetParam('lang');
  const { i18n } = useTranslation();
  useEffect(() => {
    if (!lang) {
      i18n.changeLanguage('es');
      return;
    }
    if (lang === 'es') {
      i18n.changeLanguage('es');
    } else if (lang === 'en') {
      i18n.changeLanguage('en');
    }
  }, [lang]);

  return lang;
};

export default useLang;
