export interface Language {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
}

export const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', direction: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', direction: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', direction: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', direction: 'ltr' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', direction: 'ltr' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', direction: 'ltr' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', direction: 'ltr' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', direction: 'ltr' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', direction: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', direction: 'ltr' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', direction: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', direction: 'rtl' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', direction: 'ltr' },
];

// Regional popularity weights (simplified)
// In a real app, this would be based on actual geographic data
export const regionalLanguages: Record<string, string[]> = {
  // Americas
  'US': ['en', 'es', 'zh', 'fr', 'de'],
  'CA': ['en', 'fr', 'zh', 'es', 'pa'],
  'MX': ['es', 'en', 'fr', 'de', 'pt'],
  'BR': ['pt', 'es', 'en', 'it', 'de'],
  
  // Europe
  'GB': ['en', 'fr', 'es', 'de', 'it'],
  'FR': ['fr', 'en', 'es', 'de', 'ar'],
  'DE': ['de', 'en', 'fr', 'tr', 'ru'],
  'ES': ['es', 'en', 'fr', 'de', 'ar'],
  'IT': ['it', 'en', 'fr', 'de', 'es'],
  'RU': ['ru', 'en', 'de', 'fr', 'tr'],
  
  // Asia
  'CN': ['zh', 'en', 'ja', 'ko', 'ru'],
  'IN': ['hi', 'en', 'bn', 'te', 'mr'],
  'JP': ['ja', 'en', 'zh', 'ko', 'pt'],
  'KR': ['ko', 'en', 'zh', 'ja', 'vi'],
  'PK': ['ur', 'en', 'pa', 'ar', 'hi'],
  'BD': ['bn', 'en', 'hi', 'ur', 'ar'],
  'VN': ['vi', 'en', 'zh', 'ko', 'ja'],
  'TR': ['tr', 'en', 'ar', 'de', 'ru'],
  
  // Middle East
  'SA': ['ar', 'en', 'ur', 'hi', 'bn'],
  'AE': ['ar', 'en', 'hi', 'ur', 'bn'],
  
  // Africa
  'EG': ['ar', 'en', 'fr', 'de', 'it'],
  'NG': ['en', 'ar', 'fr', 'pt', 'es'],
  'ZA': ['en', 'zu', 'af', 'es', 'pt'],
  
  // Oceania
  'AU': ['en', 'zh', 'ar', 'vi', 'it'],
  'NZ': ['en', 'zh', 'hi', 'fr', 'de'],
};

export function getLanguagesForRegion(countryCode?: string): Language[] {
  if (!countryCode || !regionalLanguages[countryCode]) {
    return languages;
  }
  
  const regionalCodes = regionalLanguages[countryCode];
  const regionalLangs = regionalCodes
    .map(code => languages.find(lang => lang.code === code))
    .filter(Boolean) as Language[];
  
  const otherLangs = languages.filter(
    lang => !regionalCodes.includes(lang.code)
  );
  
  return [...regionalLangs, ...otherLangs];
}