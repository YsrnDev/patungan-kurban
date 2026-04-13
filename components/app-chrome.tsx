'use client';

import { usePathname } from 'next/navigation';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

interface AppChromeProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

export function AppChrome({ children, isAuthenticated }: AppChromeProps) {
  const pathname = usePathname() ?? '/';
  const hidePublicChrome = pathname.startsWith('/auth') || pathname.startsWith('/dashboard');

  return (
    <>
      {hidePublicChrome ? null : <SiteHeader isAuthenticated={isAuthenticated} />}
      {children}
      {hidePublicChrome ? null : <SiteFooter />}
    </>
  );
}
