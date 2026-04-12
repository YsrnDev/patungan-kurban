'use client';

import { useEffect, useMemo, useState } from 'react';

const DISMISS_KEY = 'patungan-kurban-pwa-install-dismissed-at';
const DISMISS_TTL_MS = 1000 * 60 * 60 * 24 * 3;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

function isStandaloneMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function isDismissedRecently() {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const dismissedAt = window.localStorage.getItem(DISMISS_KEY);

    if (!dismissedAt) {
      return false;
    }

    return Date.now() - Number(dismissedAt) < DISMISS_TTL_MS;
  } catch {
    return false;
  }
}

function rememberDismissal() {
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // Ignore storage failures and keep the prompt dismissible for the session.
  }
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const syncInstalledState = () => {
      setIsInstalled(isStandaloneMode());
    };

    syncInstalledState();
    setIsDismissed(isDismissedRecently());

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIsDismissed(isDismissedRecently());
    };
    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncInstalledState);
    } else {
      mediaQuery.addListener(syncInstalledState);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);

      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', syncInstalledState);
      } else {
        mediaQuery.removeListener(syncInstalledState);
      }
    };
  }, []);

  const isVisible = useMemo(() => {
    return Boolean(deferredPrompt) && !isInstalled && !isDismissed;
  }, [deferredPrompt, isDismissed, isInstalled]);

  const handleDismiss = () => {
    rememberDismissal();
    setIsDismissed(true);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstalled(true);
      } else {
        rememberDismissal();
        setIsDismissed(true);
      }
    } catch {
      rememberDismissal();
      setIsDismissed(true);
    } finally {
      setIsInstalling(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-50 px-3 sm:bottom-5 sm:px-4">
      <div className="pointer-events-auto mx-auto flex max-w-md items-end justify-center">
        <section className="w-full overflow-hidden rounded-[24px] border border-pine/15 bg-[linear-gradient(135deg,rgba(255,252,246,0.96),rgba(246,238,225,0.94))] px-3.5 py-3 text-ink shadow-[0_18px_44px_rgba(46,79,64,0.16)] backdrop-blur-xl dark:border-gold/15 dark:bg-[linear-gradient(135deg,rgba(24,29,26,0.96),rgba(31,38,34,0.94))] dark:text-stone-100 sm:px-4 sm:py-3.5">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pine/95 text-white shadow-[0_8px_18px_rgba(46,79,64,0.18)]">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                <path d="M12 3v11" strokeLinecap="round" />
                <path d="m7.5 10.5 4.5 4.5 4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 18.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-5 text-pine dark:text-gold">Pasang Patungan Kurban</p>
              <p className="mt-0.5 text-[13px] leading-5 text-stone-600 dark:text-stone-300 sm:text-sm sm:leading-5">
                Buka lebih cepat dari layar utama dengan tampilan yang terasa seperti aplikasi.
              </p>
              <div className="mt-2.5 flex flex-col gap-2 sm:mt-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="inline-flex min-h-10 items-center justify-center rounded-full bg-pine px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(46,79,64,0.16)] transition hover:-translate-y-0.5 hover:bg-palm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isInstalling ? 'Menyiapkan...' : 'Pasang aplikasi'}
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="inline-flex min-h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-white/70 hover:text-pine dark:text-stone-300 dark:hover:bg-white/5 dark:hover:text-gold"
                >
                  Nanti saja
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
