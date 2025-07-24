import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, type TranslationKey } from '@/lib/translations';
import { languages, getLanguagesForRegion } from '@/lib/languages';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: TranslationKey) => string;
  availableLanguages: typeof languages;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<string>(() => {
    // Check localStorage first
    const saved = localStorage.getItem('language');
    if (saved && translations[saved]) {
      return saved;
    }
    
    // Try to detect user's language
    const browserLang = navigator.language.split('-')[0];
    if (translations[browserLang]) {
      return browserLang;
    }
    
    return 'en';
  });

  const [availableLanguages, setAvailableLanguages] = useState(languages);

  useEffect(() => {
    // Save language preference
    localStorage.setItem('language', language);
    
    // Set document direction for RTL languages
    const lang = languages.find(l => l.code === language);
    document.documentElement.dir = lang?.direction || 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    // Try to get user's country for regional language ordering
    const getRegionalLanguages = async () => {
      try {
        // In a real app, you'd use a geolocation API
        // For now, we'll try to infer from timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        let countryCode = 'US'; // Default
        
        // Simple mapping of common timezones to countries
        if (timezone.includes('Asia/Kolkata')) countryCode = 'IN';
        else if (timezone.includes('Asia/Shanghai')) countryCode = 'CN';
        else if (timezone.includes('Europe/London')) countryCode = 'GB';
        else if (timezone.includes('Europe/Paris')) countryCode = 'FR';
        else if (timezone.includes('Europe/Berlin')) countryCode = 'DE';
        else if (timezone.includes('Asia/Tokyo')) countryCode = 'JP';
        else if (timezone.includes('America/Mexico')) countryCode = 'MX';
        else if (timezone.includes('America/Sao_Paulo')) countryCode = 'BR';
        
        const regionalLangs = getLanguagesForRegion(countryCode);
        setAvailableLanguages(regionalLangs);
      } catch (error) {
        console.error('Failed to get regional languages:', error);
      }
    };
    
    getRegionalLanguages();
  }, []);

  const setLanguage = (lang: string) => {
    if (translations[lang]) {
      setLanguageState(lang);
    }
  };

  const t = (key: TranslationKey): string => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  const currentLang = languages.find(l => l.code === language);
  const isRTL = currentLang?.direction === 'rtl';

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      availableLanguages,
      isRTL 
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}