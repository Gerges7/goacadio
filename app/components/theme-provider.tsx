import { createContext, useContext, useEffect, useState } from 'react';
import { storageKeys } from '@/lib/storage';

export type Theme = 'light' | 'dark';
type ThemeContextValue = { theme: Theme; toggleTheme: () => void };

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let initial: Theme = 'light';
    try {
      initial = window.localStorage.getItem(storageKeys.theme) === 'dark' ? 'dark' : 'light';
    } catch {
      // Keep the accessible light default if browser storage is unavailable.
    }
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
    document.documentElement.style.colorScheme = initial;
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      window.localStorage.setItem(storageKeys.theme, theme);
    } catch {
      // The selected theme still works for this session if storage is blocked.
    }
  }, [theme, ready]);

  function toggleTheme() {
    setTheme(current => current === 'dark' ? 'light' : 'dark');
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
