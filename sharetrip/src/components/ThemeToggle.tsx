// src/components/ThemeToggle.tsx
import React from 'react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="btn theme-toggle"
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {/* Icon container for a neat morph/rotate */}
      <span className="theme-icon" aria-hidden="true">
        {isDark ? (
          // Sun
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79 1.8-1.79zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zm9.83-18.16l-1.79-1.79-1.8 1.79 1.8 1.79 1.79-1.79zM20 13h3v-2h-3v2zM11 1h2v3h-2V1zm-4.24 17.76l-1.8 1.8 1.41 1.41 1.79-1.8-1.4-1.41zM17.66 18.76l1.79 1.8 1.41-1.41-1.8-1.8-1.4 1.41zM12 6a6 6 0 100 12A6 6 0 0012 6z"/>
          </svg>
        ) : (
          // Moon
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M20.742 13.045A8.001 8.001 0 1110.955 3.258 7 7 0 1020.742 13.045z"/>
          </svg>
        )}
      </span>
      <span className="theme-label">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
}