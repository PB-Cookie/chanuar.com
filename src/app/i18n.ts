import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';

function syncDocumentLanguage(language: string) {
  if (typeof document !== 'undefined') document.documentElement.lang = language;
}

i18n.on('languageChanged', syncDocumentLanguage);

void i18n.use(initReactI18next).init({
  lng: typeof document === 'undefined' ? 'es' : document.documentElement.lang || 'es',
  fallbackLng: 'es',
  supportedLngs: ['es', 'en'],
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
