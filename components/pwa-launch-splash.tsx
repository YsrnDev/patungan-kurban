'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const VISIBLE_DURATION_MS = 5000;
const EXIT_DURATION_MS = 260;

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

export function PwaLaunchSplash() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!isStandaloneMode()) {
      return;
    }

    setIsVisible(true);

    const exitTimer = window.setTimeout(() => {
      setIsExiting(true);
    }, VISIBLE_DURATION_MS);

    const cleanupTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, VISIBLE_DURATION_MS + EXIT_DURATION_MS);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(cleanupTimer);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={[
        'pointer-events-none fixed inset-0 z-[70] flex items-center justify-center px-6 transition-all duration-300 ease-out',
        isExiting ? 'opacity-0' : 'opacity-100',
      ].join(' ')}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(246,240,229,0.98),rgba(240,231,217,0.95))] backdrop-blur-[2px] dark:bg-[linear-gradient(180deg,rgba(16,19,16,0.96),rgba(22,27,24,0.94))]" />
      <div className="absolute left-1/2 top-[18%] h-40 w-40 -translate-x-1/2 rounded-full bg-gold/20 blur-3xl dark:bg-gold/12" />
      <div className="absolute bottom-[18%] left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-pine/12 blur-3xl dark:bg-pine/18" />

      <div
        className={[
          'relative flex w-full max-w-[260px] flex-col items-center rounded-[32px] border border-pine/10 bg-[linear-gradient(145deg,rgba(255,253,248,0.9),rgba(246,238,225,0.82))] px-6 py-7 text-center shadow-[0_20px_60px_rgba(46,79,64,0.14)] transition-all duration-300 ease-out dark:border-gold/10 dark:bg-[linear-gradient(145deg,rgba(24,29,26,0.88),rgba(31,38,34,0.8))] dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)]',
          isExiting ? 'translate-y-1 scale-[0.985]' : 'translate-y-0 scale-100',
        ].join(' ')}
      >
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
        <Image
          src="/icons/icon-192.png"
          alt=""
          width={192}
          height={192}
          priority
          className="h-16 w-16 rounded-[20px] drop-shadow-[0_14px_28px_rgba(46,79,64,0.16)] dark:drop-shadow-[0_14px_28px_rgba(0,0,0,0.3)]"
          sizes="64px"
        />

        <div className="mt-4 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-palm/80 dark:text-gold/80">Patungan Kurban</p>
          <p className="font-serif text-xl font-semibold tracking-[-0.03em] text-pine dark:text-stone-100">Masjid Nurul Huda</p>
          <p className="text-sm text-stone-600 dark:text-stone-300">Membuka aplikasi...</p>
        </div>

        <div className="mt-4 h-1 w-24 overflow-hidden rounded-full bg-pine/10 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-palm via-gold to-palm"
            style={{
              animation: `pwa-launch-splash-fill ${VISIBLE_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
