export type Locale = 'en' | 'ko' | 'ja' | 'es' | 'fr' | 'de';

export const locales: Locale[] = ['en', 'ko', 'ja', 'es', 'fr', 'de'];

export const defaultLocale: Locale = 'en';

export interface LocaleConfig {
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
}

export const localeConfig: Record<Locale, LocaleConfig> = {
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY'
  },
  ko: {
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷', 
    direction: 'ltr',
    dateFormat: 'YYYY.MM.DD'
  },
  ja: {
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    direction: 'ltr',
    dateFormat: 'YYYY/MM/DD'
  },
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY'
  },
  fr: {
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY'
  },
  de: {
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    direction: 'ltr',
    dateFormat: 'DD.MM.YYYY'
  }
};

// Translation keys interface
export interface TranslationKeys {
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    search: string;
    filter: string;
    sort: string;
    share: string;
    copy: string;
    download: string;
  };
  navigation: {
    home: string;
    features: string;
    team: string;
    columns: string;
    about: string;
    contact: string;
    openMenu: string;
    closeMenu: string;
  };
  hero: {
    title: string;
    tagline: string;
    subtitle: string;
    cta: {
      primary: string;
      secondary: string;
    };
    philosophy: string;
    scrollHint: string;
  };
  features: {
    title: string;
    subtitle: string;
    research: {
      title: string;
      description: string;
    };
    podcast: {
      title: string;
      description: string;
    };
    education: {
      title: string;
      description: string;
    };
  };
  team: {
    title: string;
    members: {
      jay: {
        role: string;
        credential: string;
      };
      ryan: {
        role: string;
        credential: string;
      };
      jy: {
        role: string;
        credential: string;
      };
      tj: {
        role: string;
        credential: string;
      };
      kiwon: {
        role: string;
        credential: string;
      };
    };
  };
  columns: {
    title: string;
    subtitle: string;
    readMore: string;
    viewAll: string;
    readTime: string;
    categories: {
      research: string;
      analysis: string;
      education: string;
      opinion: string;
    };
  };
  footer: {
    tagline: string;
    copyright: string;
    links: {
      privacy: string;
      terms: string;
      contact: string;
    };
  };
  errors: {
    generic: {
      title: string;
      message: string;
      cta: string;
    };
    notFound: {
      title: string;
      message: string;
      cta: string;
    };
    serverError: {
      title: string;
      message: string;
      cta: string;
    };
  };
  meta: {
    title: string;
    description: string;
    keywords: string[];
  };
}

// Default English translations
export const defaultTranslations: TranslationKeys = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    retry: 'Try Again',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    share: 'Share',
    copy: 'Copy',
    download: 'Download',
  },
  navigation: {
    home: 'Home',
    features: 'What We Do',
    team: 'Team',
    columns: 'Columns',
    about: 'About',
    contact: 'Contact',
    openMenu: 'Open navigation menu',
    closeMenu: 'Close navigation menu',
  },
  hero: {
    title: 'HypeProof AI',
    tagline: 'We Don\'t Chase Hype. We Prove It.',
    subtitle: 'Deep research, honest conversations, and practical AI insights for builders and skeptics alike.',
    cta: {
      primary: 'Contact',
      secondary: 'Learn More',
    },
    philosophy: 'We don\'t chase Hype. We Prove it.',
    scrollHint: 'Scroll to explore',
  },
  features: {
    title: 'What We Do',
    subtitle: 'Three tracks to explore the future of AI',
    research: {
      title: 'Research',
      description: 'Pushing AI boundaries through daily experiments and rigorous validation methods.',
    },
    podcast: {
      title: 'Podcast',
      description: 'Deep-dive conversations on AI trends, tools, and the people building tomorrow.',
    },
    education: {
      title: 'Education',
      description: 'Designing new paradigms for learning in the age of artificial intelligence.',
    },
  },
  team: {
    title: 'The Team',
    members: {
      jay: {
        role: 'Lead / Tech',
        credential: 'Staff Engineer @ Silicon Valley',
      },
      ryan: {
        role: 'Research / Data',
        credential: 'Physics PhD, Quant Dev',
      },
      jy: {
        role: 'Research / AI',
        credential: 'AI Engineer, M.S. Physics',
      },
      tj: {
        role: 'Content / Media',
        credential: 'Ex-Founder, Media Specialist',
      },
      kiwon: {
        role: 'Marketing',
        credential: 'GWU, Global Marketing',
      },
    },
  },
  columns: {
    title: 'Columns',
    subtitle: 'Sharp takes on AI, tech, and the future',
    readMore: 'Read more',
    viewAll: 'View all',
    readTime: 'min read',
    categories: {
      research: 'Research',
      analysis: 'Analysis',
      education: 'Education',
      opinion: 'Opinion',
    },
  },
  footer: {
    tagline: 'We Don\'t Chase Hype. We Prove It.',
    copyright: '© 2026 HypeProof AI. All rights reserved.',
    links: {
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      contact: 'Contact Us',
    },
  },
  errors: {
    generic: {
      title: 'Something went wrong',
      message: 'We encountered an unexpected error. Our AI engineers have been notified.',
      cta: 'Try Again',
    },
    notFound: {
      title: 'Page Not Found',
      message: 'The page you\'re looking for doesn\'t exist or has been moved.',
      cta: 'Go Home',
    },
    serverError: {
      title: 'Server Error',
      message: 'Our servers are experiencing issues. Please try again later.',
      cta: 'Retry',
    },
  },
  meta: {
    title: 'HypeProof AI - We Don\'t Chase Hype. We Prove It.',
    description: 'Deep research, honest conversations, and practical AI insights for builders and skeptics alike.',
    keywords: [
      'AI research', 'artificial intelligence', 'AI podcast', 'machine learning',
      'AI tools', 'technology research', 'AI insights', 'AI validation'
    ],
  },
};

// Simple translation function
export function t(locale: Locale, key: string, translations?: Partial<TranslationKeys>): string {
  const keys = key.split('.');
  let value: any = translations || defaultTranslations;
  
  for (const k of keys) {
    value = value?.[k];
    if (!value) break;
  }
  
  return value || key;
}

// Format date according to locale
export function formatDate(date: Date, locale: Locale): string {
  const config = localeConfig[locale];
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : locale, options).format(date);
}

// Format numbers according to locale
export function formatNumber(number: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : locale).format(number);
}

// Get browser's preferred locale
export function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  
  const browserLang = navigator.language.split('-')[0];
  return locales.includes(browserLang as Locale) ? browserLang as Locale : defaultLocale;
}

// Pluralization rules (simplified)
export function plural(locale: Locale, count: number, forms: { zero?: string; one: string; other: string }): string {
  if (count === 0 && forms.zero) return forms.zero;
  if (count === 1) return forms.one;
  return forms.other;
}