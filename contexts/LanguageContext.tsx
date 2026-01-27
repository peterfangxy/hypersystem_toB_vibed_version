
import React, { createContext, useContext, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();

  const setLanguage = (lang: Language) => {
    // Check if i18n is defined and has changeLanguage method
    if (i18n && typeof i18n.changeLanguage === 'function') {
        i18n.changeLanguage(lang);
    } else {
        console.error("i18n instance is missing or invalid in LanguageProvider");
    }
  };

  // Ensure i18n.language is defined before checking startsWith
  const currentLang = i18n?.language || 'en';
  const language = (currentLang === 'zh' || currentLang.startsWith('zh-')) ? 'zh' : 'en';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
