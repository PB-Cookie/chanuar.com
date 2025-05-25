import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import portfolioEs from './src/lang/es/portfolio.json';
import portfolioEn from './src/lang/en/portfolio.json';
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: true,
    resources: {
      es: {
        portfolio: portfolioEs,
      },
      en: {
        portfolio: portfolioEn,
      },
    },
    defaultNS: 'portfolio',
  });

export default i18n;
