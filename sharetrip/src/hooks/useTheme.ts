// src/hooks/useTheme.ts
import { useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';

const THEME_KEY = 'tripshare-theme';

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(THEME_KEY) as Theme | null;
  return stored ?? getSystemTheme();
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Keep body class in sync + persist
  useEffect(() => {
    const el = document.body;
    if (theme === 'dark') el.classList.add('dark');
    else el.classList.remove('dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // If user never toggled, respond to system changes
  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return; // user chose explicitly; don't override
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setTheme(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return useMemo(() => ({ theme, setTheme, toggleTheme, isDark: theme === 'dark' }), [theme]);
}