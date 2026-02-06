'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Locale, 
  defaultLocale, 
  TranslationKeys, 
  defaultTranslations,
  getBrowserLocale,
  t,
  formatDate,
  formatNumber,
  plural,
  localeConfig
} from '@/lib/i18n';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  translations: TranslationKeys;
  t: (key: string, vars?: Record<string, string | number>) => string;
  formatDate: (date: Date) => string;
  formatNumber: (number: number) => string;
  plural: (count: number, forms: { zero?: string; one: string; other: string }) => string;
  isRTL: boolean;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ 
  children, 
  initialLocale 
}) => {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLocale);
  const [translations, setTranslations] = useState<TranslationKeys>(defaultTranslations);
  const [isLoading, setIsLoading] = useState(false);

  // Load translations for the current locale
  const loadTranslations = async (targetLocale: Locale) => {
    if (targetLocale === 'en') {
      setTranslations(defaultTranslations);
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, you'd load from an API or import dynamically
      // For now, we'll use default translations as fallback
      const response = await import(`@/locales/${targetLocale}.json`).catch(() => null);
      if (response) {
        setTranslations({ ...defaultTranslations, ...response.default });
      } else {
        setTranslations(defaultTranslations);
      }
    } catch (error) {
      console.warn(`Failed to load translations for ${targetLocale}:`, error);
      setTranslations(defaultTranslations);
    } finally {
      setIsLoading(false);
    }
  };

  // Set locale with persistence
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('preferred-locale', newLocale);
    document.documentElement.lang = newLocale;
    document.documentElement.dir = localeConfig[newLocale].direction;
    loadTranslations(newLocale);
  };

  // Translation function with variable interpolation
  const translate = (key: string, vars?: Record<string, string | number>): string => {
    let translation = t(locale, key, translations);
    
    if (vars) {
      Object.entries(vars).forEach(([varKey, varValue]) => {
        translation = translation.replace(new RegExp(`{{${varKey}}}`, 'g'), String(varValue));
      });
    }
    
    return translation;
  };

  // Initialize locale on mount
  useEffect(() => {
    const storedLocale = localStorage.getItem('preferred-locale') as Locale;
    const browserLocale = getBrowserLocale();
    const initialLoc = initialLocale || storedLocale || browserLocale;
    
    if (initialLoc !== locale) {
      setLocale(initialLoc);
    } else {
      loadTranslations(locale);
    }
  }, []);

  const value: I18nContextType = {
    locale,
    setLocale,
    translations,
    t: translate,
    formatDate: (date: Date) => formatDate(date, locale),
    formatNumber: (number: number) => formatNumber(number, locale),
    plural: (count: number, forms: { zero?: string; one: string; other: string }) => 
      plural(locale, count, forms),
    isRTL: localeConfig[locale].direction === 'rtl',
    isLoading,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

// Custom hook to use i18n context
export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Hook for easy translation access
export const useTranslation = (namespace?: string) => {
  const { t, locale } = useI18n();
  
  const translate = (key: string, vars?: Record<string, string | number>) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return t(fullKey, vars);
  };
  
  return { t: translate, locale };
};

// Language switcher component
export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const availableLocales: Locale[] = ['en', 'ko'];

  return (
    <div className={`relative ${className}`}>
      <button
        className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors rounded-md"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
      >
        <span className="text-lg">{localeConfig[locale].flag}</span>
        <span className="hidden sm:inline">{localeConfig[locale].nativeName}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-md shadow-xl z-20 min-w-[160px]">
            {availableLocales.map((loc) => (
              <button
                key={loc}
                className={`flex items-center gap-3 w-full px-4 py-2 text-sm text-left hover:bg-zinc-800 transition-colors ${
                  loc === locale ? 'text-purple-400 bg-zinc-800/50' : 'text-zinc-300'
                }`}
                onClick={() => {
                  setLocale(loc);
                  setIsOpen(false);
                }}
              >
                <span className="text-lg">{localeConfig[loc].flag}</span>
                <div>
                  <div className="font-medium">{localeConfig[loc].nativeName}</div>
                  <div className="text-xs text-zinc-500">{localeConfig[loc].name}</div>
                </div>
                {loc === locale && (
                  <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};