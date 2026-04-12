'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { BrandLogo } from '@/components/brand-logo';
import { NavPillLink } from '@/components/navigation/nav-pill-link';
import { ThemeToggle } from '@/components/theme-toggle';

const mobileNavItems = [
  { href: '/', label: 'Beranda' },
  { href: '/register', label: 'Daftar' },
];

interface SiteHeaderProps {
  isAuthenticated: boolean;
}

export function SiteHeader({ isAuthenticated }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    if (mobileMenuOpen) {
      root.classList.add('public-mobile-menu-open');
    } else {
      root.classList.remove('public-mobile-menu-open');
    }

    return () => {
      root.classList.remove('public-mobile-menu-open');
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function toggleMobileMenu() {
    setMobileMenuOpen((current) => !current);
  }

  return (
    <header className="site-header sticky top-0 z-50 border-b border-white/60 bg-sand/88 backdrop-blur-xl dark:border-stone-800 dark:bg-stone-950/70">
      <div className="relative mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 lg:gap-6">
          <Link href="/" className="brand-logo-link flex min-w-0 items-center gap-3" onClick={closeMobileMenu}>
            <BrandLogo
              priority
              markClassName="h-10 w-10 rounded-xl shadow-md sm:h-11 sm:w-11"
              eyebrowClassName="text-[11px] tracking-[0.28em] text-ember sm:text-xs"
              titleClassName="text-sm font-semibold text-pine dark:text-stone-100"
            />
          </Link>

          <div className="hidden items-center gap-3 lg:flex">
            <nav className="flex items-center gap-3 text-sm font-medium text-stone-700 dark:text-stone-200">
              <NavPillLink href="/" label="Beranda" exact />
              <NavPillLink href="/register" label="Daftar" exact />
            </nav>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link href="/dashboard" className="button-primary px-4 py-2">
                  Dashboard
                </Link>
              ) : null}
              <ThemeToggle variant="public-header-icon" label="Toggle dark mode" />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-controls="public-mobile-menu"
              aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              className="public-menu-button touch-target inline-flex h-11 w-11 items-center justify-center rounded-xl border border-pine/15 bg-white/90 text-pine shadow-[0_10px_24px_rgba(21,54,41,0.08)] transition hover:-translate-y-0.5 hover:border-palm hover:text-palm dark:border-stone-700 dark:bg-stone-950/85 dark:text-stone-100 dark:hover:border-gold/50 dark:hover:text-gold"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div
          id="public-mobile-menu"
          className={`public-mobile-menu absolute inset-x-4 top-full z-[60] pt-3 lg:hidden ${mobileMenuOpen ? 'public-mobile-menu-open' : 'pointer-events-none'}`}
        >
          <nav className="public-mobile-menu-panel flex flex-col gap-3 rounded-[28px] border border-white/70 bg-white/95 p-4 shadow-[0_24px_60px_rgba(21,54,41,0.12)] backdrop-blur-xl dark:border-stone-800 dark:bg-stone-950/95">
            {mobileNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className="public-mobile-link inline-flex min-h-[48px] items-center rounded-2xl border border-pine/10 bg-sand/70 px-4 py-3 text-sm font-semibold text-pine transition hover:border-palm hover:text-palm dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-100 dark:hover:border-gold/50 dark:hover:text-gold"
              >
                {item.label}
              </Link>
            ))}

            <ThemeToggle variant="sidebar" className="public-mobile-theme-toggle justify-between" onToggle={closeMobileMenu} label="Darkmode" />

            {isAuthenticated ? (
              <>
                <Link href="/dashboard" onClick={closeMobileMenu} className="button-primary w-full justify-center">
                  Dashboard
                </Link>
              </>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  );
}
