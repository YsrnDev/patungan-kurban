'use client';

import { useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'patungan-kurban-theme';

type ThemeMode = 'light' | 'dark';

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;

  root.classList.toggle('dark', mode === 'dark');
  root.style.colorScheme = mode;
}

type ThemeToggleVariant = 'default' | 'compact' | 'sidebar' | 'mobile-header' | 'icon-only' | 'public-header-icon';

interface ThemeToggleProps {
  className?: string;
  variant?: ThemeToggleVariant;
  onToggle?: () => void;
  label?: string;
}

export function ThemeToggle({ className = '', variant = 'default', onToggle, label }: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const nextTheme: ThemeMode = savedTheme === 'dark' ? 'dark' : 'light';

    applyTheme(nextTheme);
    setTheme(nextTheme);
    setMounted(true);
  }, []);

  function toggleTheme() {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';

    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    onToggle?.();
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle theme-toggle-${variant} ${className}`.trim()}
      aria-label={mounted ? `Aktifkan mode ${theme === 'dark' ? 'terang' : 'gelap'}` : 'Ubah tema'}
      aria-pressed={theme === 'dark'}
      title={mounted ? `Mode ${theme === 'dark' ? 'gelap' : 'terang'} aktif` : 'Ubah tema'}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {theme === 'dark' ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="theme-toggle-icon-svg h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75 9.75 9.75 0 0 1 8.25 6c0-1.33.266-2.597.748-3.752A9.75 9.75 0 1 0 21.75 15l.002.002Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="theme-toggle-icon-svg h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5m0 15V21m9-9h-1.5m-15 0H3m15.364 6.364-1.06-1.06M6.697 6.697 5.636 5.636m12.728 0-1.06 1.06M6.697 17.303l-1.06 1.06M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
          </svg>
        )}
      </span>
      <span className={`theme-toggle-label ${variant === 'icon-only' || variant === 'public-header-icon' ? 'sr-only' : ''}`.trim()}>
        {label ?? (mounted ? (theme === 'dark' ? 'Mode Gelap' : 'Mode Terang') : 'Tema')}
      </span>
    </button>
  );
}
