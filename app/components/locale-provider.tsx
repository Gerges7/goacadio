import { createContext, useContext, useEffect, useState } from 'react';
import { storageKeys } from '@/lib/storage';

type Locale = 'ar' | 'en';
type LocaleContextValue = { lang: Locale; setLang: (next: Locale) => void; text: (ar: string, en: string) => string };
const LocaleContext = createContext<LocaleContextValue>({ lang: 'ar', setLang: () => {}, text: (ar) => ar });
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Locale>('ar');
  useEffect(() => {
    const stored = window.localStorage.getItem(storageKeys.locale);
    if (stored === 'en' || stored === 'ar') setLangState(stored);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);
  function setLang(next: Locale) {
    setLangState(next);
    window.localStorage.setItem(storageKeys.locale, next);
  }
  return <LocaleContext.Provider value={{ lang, setLang, text: (ar, en) => lang === 'ar' ? ar : en }}>{children}</LocaleContext.Provider>;
}
export function useLocale() { return useContext(LocaleContext); }
