'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LogoutButton } from '@/components/auth/logout-button';
import { BrandLogo } from '@/components/brand-logo';
import { getVisibleDashboardNavItems } from '@/components/dashboard/dashboard-nav';
import { ThemeToggle } from '@/components/theme-toggle';

interface DashboardSidebarProps {
  userEmail: string;
  role: string;
  isAdmin: boolean;
}

export function DashboardSidebar({ userEmail, role, isAdmin }: DashboardSidebarProps) {
  const pathname = usePathname();
  const navItems = getVisibleDashboardNavItems(isAdmin);
  const normalizedRole = role.trim().toLowerCase();
  const roleLabel = normalizedRole === 'admin' ? 'Admin' : normalizedRole === 'panitia' ? 'Panitia' : role;
  const roleBadgeClassName = normalizedRole === 'admin' ? 'dashboard-role-badge dashboard-role-badge-admin' : normalizedRole === 'panitia' ? 'dashboard-role-badge dashboard-role-badge-panitia' : 'dashboard-role-badge';

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar-content">
        <Link href="/dashboard" className="dashboard-brand">
          <BrandLogo
            markClassName="dashboard-brand-mark"
            textClassName="min-w-0"
            eyebrowClassName="text-[10px] tracking-[0.22em] text-amber-700 dark:text-gold"
            titleAs="h1"
            titleClassName="mt-0.5 truncate font-serif-display text-[15px] leading-tight text-pine dark:text-stone-100"
          />
        </Link>

        <nav className="dashboard-sidebar-nav" aria-label="Dashboard navigation">
          <ul className="space-y-0.5">
            {navItems.map((item) => (
              <li key={item.href}>
                <NavItem href={item.href} exact={item.exact} icon={<item.icon className="h-5 w-5" />} label={item.label} pathname={pathname} />
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="dashboard-sidebar-footer">
        <div className="dashboard-sidebar-account">
          <div className="dashboard-sidebar-account-row">
            <div className="dashboard-sidebar-account-copy">
              <div className="dashboard-sidebar-account-meta">
                <p className="dashboard-sidebar-account-email">{userEmail}</p>
                <span className={roleBadgeClassName}>{roleLabel}</span>
              </div>
            </div>
            <LogoutButton
              className="dashboard-sidebar-logout"
              formClassName="dashboard-sidebar-logout-form"
              iconClassName="h-[22px] w-[22px]"
              iconOnly
            />
          </div>
        </div>
        <ThemeToggle variant="sidebar-segmented" className="dashboard-sidebar-theme-toggle" />
      </div>
    </aside>
  );
}

export function DashboardMobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!menuContainerRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <header className="dashboard-mobile-header lg:hidden">
      <div className="dashboard-mobile-header-shell">
        <Link href="/dashboard" className="dashboard-brand dashboard-mobile-brand">
          <BrandLogo
            markClassName="dashboard-brand-mark"
            textClassName="min-w-0"
            eyebrowClassName="text-[9px] tracking-[0.22em] text-amber-700 dark:text-gold"
            titleAs="h1"
            titleClassName="mt-0.5 truncate font-serif-display text-base leading-tight text-pine dark:text-stone-100"
          />
        </Link>

        <div className="dashboard-mobile-header-menu" ref={menuContainerRef}>
          <button
            type="button"
            className={`dashboard-mobile-menu-trigger ${menuOpen ? 'dashboard-mobile-menu-trigger-open' : ''}`}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-haspopup="menu"
            aria-label={menuOpen ? 'Tutup menu header' : 'Buka menu header'}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span className="sr-only">Menu</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 7.5h15m-15 4.5h15m-15 4.5h15" />
              )}
            </svg>
          </button>

          {menuOpen ? (
            <div
              id={menuId}
              className="dashboard-mobile-menu-panel dashboard-mobile-menu-panel-open"
              role="menu"
              aria-label="Menu header mobile"
            >
              <Link href="/" className="dashboard-mobile-menu-link" role="menuitem" onClick={() => setMenuOpen(false)}>
                <span>Beranda</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
                </svg>
              </Link>
              <ThemeToggle variant="sidebar" className="dashboard-mobile-menu-action" onToggle={() => setMenuOpen(false)} />
              <LogoutButton className="dashboard-mobile-menu-logout" formClassName="dashboard-mobile-menu-form" />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export function DashboardMobileNav({ isAdmin }: Pick<DashboardSidebarProps, 'isAdmin'>) {
  const pathname = usePathname();
  const navItems = getVisibleDashboardNavItems(isAdmin);
  const mobileNavStyle = { '--dashboard-mobile-nav-count': navItems.length } as React.CSSProperties;

  return (
    <nav className="dashboard-mobile-nav lg:hidden" aria-label="Dashboard navigation mobile">
      <div className="dashboard-mobile-nav-shell" style={mobileNavStyle}>
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`dashboard-mobile-nav-link ${active ? 'dashboard-mobile-nav-link-active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="dashboard-mobile-nav-icon">
                <Icon className="h-5 w-5" />
              </span>
              <span className="dashboard-mobile-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function NavItem({ href, icon, label, pathname, exact = false }: { href: string; icon: React.ReactNode; label: string; pathname: string; exact?: boolean }) {
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
        active
          ? 'bg-pine text-white shadow-md'
          : 'text-stone-600 hover:bg-stone-100 hover:text-pine dark:text-stone-300 dark:hover:bg-stone-900 dark:hover:text-gold'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      <span className={`flex h-5 w-5 items-center justify-center ${active ? 'text-white' : 'text-stone-500 group-hover:text-pine dark:text-stone-500 dark:group-hover:text-gold'}`}>
        {icon}
      </span>
      <span className={`${active ? 'font-semibold text-white' : 'font-medium'}`}>{label}</span>
    </Link>
  );
}
