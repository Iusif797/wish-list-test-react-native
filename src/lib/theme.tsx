import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'dark' | 'light';

interface ThemeCtx {
  theme: Theme;
  toggle: () => Promise<void>;
}

const ThemeContext = createContext<ThemeCtx>({ theme: 'dark', toggle: async () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('theme');
        if (stored === 'light' || stored === 'dark') {
          setTheme(stored as Theme);
        } else {
          setTheme('dark');
        }
      } catch {
        setTheme('dark');
      } finally {
        setMounted(true);
      }
    })();
  }, []);

  async function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    await AsyncStorage.setItem('theme', next);
  }

  if (!mounted) return null;

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
