
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import Translation Barrels
import en from './locales/en/index';
import zh_TW from './locales/zh_TW/index';

// Explicitly create a new i18n instance
const i18n = i18next.createInstance();

const resources = {
  en: {
    translation: en
  },
  zh_TW: {
    translation: zh_TW
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
