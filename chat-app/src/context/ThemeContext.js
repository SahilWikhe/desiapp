import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { darkTheme, lightTheme, themeVariants } from '../theme/theme';

const STORAGE_KEY = 'chat-app:color-scheme';

const ThemeContext = createContext(null);

function resolveTheme(mode) {
  return mode === 'dark' ? darkTheme : lightTheme;
}

export function ThemeProvider({ children }) {
  const systemScheme = Appearance.getColorScheme();
  const [colorScheme, setColorScheme] = useState(systemScheme === 'dark' ? 'dark' : 'light');
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (isMounted && (stored === 'light' || stored === 'dark')) {
          setColorScheme(stored);
        }
      } finally {
        if (isMounted) setBootstrapped(true);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const persistScheme = useCallback(async (scheme) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, scheme);
    } catch {}
  }, []);

  const setScheme = useCallback((scheme) => {
    setColorScheme(scheme);
    persistScheme(scheme);
  }, [persistScheme]);

  const toggleScheme = useCallback(() => {
    setColorScheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      persistScheme(next);
      return next;
    });
  }, [persistScheme]);

  const theme = useMemo(() => resolveTheme(colorScheme), [colorScheme]);

  const value = useMemo(
    () => ({
      theme,
      colorScheme,
      setScheme,
      toggleScheme,
      variants: themeVariants,
      bootstrapped,
    }),
    [colorScheme, theme, setScheme, toggleScheme, bootstrapped]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
