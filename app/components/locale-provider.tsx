import { createContext, useContext, useEffect, useState } from 'react';
import { storageKeys } from '@/lib/storage';

type Locale = 'ar' | 'en';
type LocaleContextValue = { lang: Locale; setLang: (next: Locale) => void; text: (ar: string, en: string) => string };
const LocaleContext = createContext<LocaleContextValue>({ lang: 'ar', setLang: () => {}, text: (ar) => ar });

function readStoredLocale(): Locale | null {
  try {
    const stored = window.localStorage.getItem(storageKeys.locale);
    return stored === 'en' || stored === 'ar' ? stored : null;
  } catch {
    // Language switching still works for the current session if storage is blocked.
    return null;
  }
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Locale>('ar');

  useEffect(() => {
    const stored = readStoredLocale();
    if (stored) setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  function setLang(next: Locale) {
    setLangState(next);
    // Update document direction immediately; the effect below also handles stored locale on load.
    document.documentElement.lang = next;
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
    try {
      window.localStorage.setItem(storageKeys.locale, next);
    } catch {
      // The selected language remains active until the page is closed.
    }
  }

  return <LocaleContext.Provider value={{ lang, setLang, text: (ar, en) => lang === 'ar' ? ar : en }}>{children}</LocaleContext.Provider>;
}
export function useLocale() { return useContext(LocaleContext); }
