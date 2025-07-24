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
    // Only access browser APIs on client side
    if (typeof window !== 'undefined') {
      // Check localStorage first
      try {
        const saved = localStorage.getItem('language');
        if (saved && translations[saved]) {
          return saved;
        }
      } catch (error) {
        console.error('Failed to access localStorage:', error);
      }
      
      // Try to detect user's language
      try {
        if (navigator && navigator.language) {
          const browserLang = navigator.language.split('-')[0];
          if (translations[browserLang]) {
            return browserLang;
          }
        }
      } catch (error) {
        console.error('Failed to detect browser language:', error);
      }
    }
    
    return 'en';
  });

  const [availableLanguages, setAvailableLanguages] = useState(languages);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Only set document direction on initial load
      // (setLanguage will handle it on changes)
      const lang = languages.find(l => l.code === language);
      if (document && document.documentElement) {
        document.documentElement.dir = lang?.direction || 'ltr';
        document.documentElement.lang = language;
      }
    }
  }, []);

  useEffect(() => {
    // Try to get user's country for regional language ordering
    const getRegionalLanguages = async () => {
      try {
        // Check if Intl API is available
        if (typeof window !== 'undefined' && window.Intl && Intl.DateTimeFormat) {
          // In a real app, you'd use a geolocation API
          // For now, we'll try to infer from timezone
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          let countryCode = 'US'; // Default
          
          // Simple mapping of common timezones to countries
          if (timezone?.includes('Asia/Kolkata')) countryCode = 'IN';
          else if (timezone?.includes('Asia/Shanghai')) countryCode = 'CN';
          else if (timezone?.includes('Europe/London')) countryCode = 'GB';
          else if (timezone?.includes('Europe/Paris')) countryCode = 'FR';
          else if (timezone?.includes('Europe/Berlin')) countryCode = 'DE';
          else if (timezone?.includes('Asia/Tokyo')) countryCode = 'JP';
          else if (timezone?.includes('America/Mexico')) countryCode = 'MX';
          else if (timezone?.includes('America/Sao_Paulo')) countryCode = 'BR';
          
          const regionalLangs = getLanguagesForRegion(countryCode);
          setAvailableLanguages(regionalLangs);
        }
      } catch (error) {
        console.error('Failed to get regional languages:', error);
        // Use default language list if error occurs
        setAvailableLanguages(languages);
      }
    };
    
    getRegionalLanguages();
  }, []);

  const setLanguage = (lang: string) => {
    // Always allow setting the language, even if translations don't exist yet
    // We'll fall back to English for missing translations
    setLanguageState(lang);
    
    // Save to localStorage
    try {
      localStorage.setItem('language', lang);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
    
    // Update document direction for RTL languages
    const selectedLang = languages.find(l => l.code === lang);
    if (selectedLang) {
      document.documentElement.dir = selectedLang.direction;
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