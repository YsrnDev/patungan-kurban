import type { Metadata, Viewport } from 'next';
import { Inter, Sora } from 'next/font/google';

import '@/app/globals.css';
import { PwaLaunchSplash } from '@/components/pwa-launch-splash';
import { PwaRegister } from '@/components/pwa-register';
import { getCurrentUser } from '@/lib/auth';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const serif = Sora({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  applicationName: 'Patungan Kurban',
  title: 'Patungan Kurban',
  description: 'Patungan kurban dengan pendaftaran mandiri jamaah dan dashboard operasional panitia berbasis Supabase.',
  manifest: '/manifest.webmanifest',
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Patungan Kurban',
  },
};

export const viewport: Viewport = {
  themeColor: '#2f5e4b',
  colorScheme: 'light dark',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${sans.variable} ${serif.variable} font-sans text-ink antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var theme=localStorage.getItem('patungan-kurban-theme');var dark=theme==='dark';document.documentElement.classList.toggle('dark',dark);document.documentElement.style.colorScheme=dark?'dark':'light';}catch(e){document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='light';}})();`,
          }}
        />
        <PwaRegister />
        <PwaLaunchSplash />
        <div className="app-shell relative overflow-x-clip">
          <div className="absolute inset-x-0 top-0 -z-10 h-[580px] bg-hero-glow dark:opacity-70" />
          <div className="absolute left-[-12rem] top-32 -z-10 h-72 w-72 rounded-full bg-amber-100/50 blur-3xl dark:bg-amber-700/20" />
          <div className="absolute right-[-10rem] top-56 -z-10 h-80 w-80 rounded-full bg-palm/10 blur-3xl dark:bg-palm/20" />
          <SiteHeader isAuthenticated={Boolean(currentUser)} />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
