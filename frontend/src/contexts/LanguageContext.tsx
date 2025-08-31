import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' }
];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  languages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    // Get saved language from localStorage or default to English
    const savedLang = localStorage.getItem('selectedLanguage');
    return languages.find(lang => lang.code === savedLang) || languages[0];
  });

  const [translations, setTranslations] = useState<Record<string, any>>({});

  // Load translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const response = await import(`../translations/${currentLanguage.code}.json`);
        setTranslations(response.default);
      } catch (error) {
        console.warn(`Failed to load translations for ${currentLanguage.code}, falling back to English`);
        if (currentLanguage.code !== 'en') {
          try {
            const response = await import('../translations/en.json');
            setTranslations(response.default);
          } catch (fallbackError) {
            console.error('Failed to load English translations:', fallbackError);
            setTranslations({});
          }
        }
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('selectedLanguage', language.code);
    // Update document direction for RTL languages
    document.documentElement.dir = language.code === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language.code;
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    
    // Replace parameters if provided
    if (params) {
      return Object.entries(params).reduce((text, [param, val]) => {
        return text.replace(new RegExp(`{{${param}}}`, 'g'), String(val));
      }, value);
    }
    
    return value;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
