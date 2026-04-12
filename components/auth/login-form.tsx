'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, Timer } from 'lucide-react';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { getSupabasePublicEnvStatus } from '@/lib/supabase/config';

interface LoginFormProps {
  nextPath: string;
  defaultEmail?: string;
}

const SUCCESS_COOLDOWN_SECONDS = 45;
const RATE_LIMIT_COOLDOWN_SECONDS = 300;
const LOGIN_COOLDOWN_STORAGE_KEY = 'patungan-kurban:login-cooldown';

type CooldownReason = 'success' | 'rate-limit';

interface StoredCooldown {
  expiresAt: number;
  reason: CooldownReason;
}

function isRateLimitError(message: string) {
  const normalized = message.toLowerCase();

  return normalized.includes('rate limit') || normalized.includes('too many requests');
}

function formatCooldownLabel(seconds: number) {
  return `Coba lagi dalam ${seconds} dtk`;
}

function getRemainingCooldownSeconds(expiresAt: number) {
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
}

function readStoredCooldown() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(LOGIN_COOLDOWN_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as Partial<StoredCooldown>;

    if (
      typeof parsedValue.expiresAt !== 'number' ||
      (parsedValue.reason !== 'success' && parsedValue.reason !== 'rate-limit')
    ) {
      window.localStorage.removeItem(LOGIN_COOLDOWN_STORAGE_KEY);
      return null;
    }

    if (getRemainingCooldownSeconds(parsedValue.expiresAt) <= 0) {
      window.localStorage.removeItem(LOGIN_COOLDOWN_STORAGE_KEY);
      return null;
    }

    return parsedValue as StoredCooldown;
  } catch {
    window.localStorage.removeItem(LOGIN_COOLDOWN_STORAGE_KEY);
    return null;
  }
}

function persistCooldown(reason: CooldownReason, durationSeconds: number) {
  if (typeof window === 'undefined') {
    return null;
  }

  const cooldown = {
    reason,
    expiresAt: Date.now() + durationSeconds * 1000,
  } satisfies StoredCooldown;

  window.localStorage.setItem(LOGIN_COOLDOWN_STORAGE_KEY, JSON.stringify(cooldown));

  return cooldown;
}

function clearStoredCooldown() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(LOGIN_COOLDOWN_STORAGE_KEY);
}

export function LoginForm({ nextPath, defaultEmail = '' }: LoginFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [cooldownReason, setCooldownReason] = useState<CooldownReason | null>(null);
  const [cooldownExpiresAt, setCooldownExpiresAt] = useState(0);
  const [cooldownNow, setCooldownNow] = useState(() => Date.now());
  const cooldownSeconds = cooldownExpiresAt > 0 ? Math.max(0, Math.ceil((cooldownExpiresAt - cooldownNow) / 1000)) : 0;
  const envStatus = useMemo(() => getSupabasePublicEnvStatus(), []);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    const storedCooldown = readStoredCooldown();

    if (!storedCooldown) {
      return;
    }

    setCooldownReason(storedCooldown.reason);
    setCooldownExpiresAt(storedCooldown.expiresAt);
  }, []);

  useEffect(() => {
    if (cooldownExpiresAt <= 0) {
      return;
    }

    const syncCooldown = () => {
      setCooldownNow(Date.now());

      if (getRemainingCooldownSeconds(cooldownExpiresAt) > 0) {
        return;
      }

      clearStoredCooldown();
      setCooldownExpiresAt(0);
      setCooldownReason(null);
    };

    syncCooldown();

    const timer = window.setInterval(() => {
      syncCooldown();
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownExpiresAt]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase || !envStatus.isConfigured) {
      setStatus('error');
      setMessage(
        envStatus.message ||
          'Konfigurasi Supabase publik belum lengkap. Periksa NEXT_PUBLIC_SUPABASE_URL dan key publik di environment app.',
      );
      return;
    }

    if (cooldownSeconds > 0) {
      setStatus('error');
      setMessage(
        cooldownReason === 'rate-limit'
          ? `Terlalu banyak permintaan email login telah dikirim. ${formatCooldownLabel(cooldownSeconds)} sebelum mencoba lagi.`
          : `Magic link baru saja dikirim. ${formatCooldownLabel(cooldownSeconds)} sebelum meminta tautan baru.`,
      );
      return;
    }

    setStatus('loading');
    setMessage('Mengirim magic link ke email Anda...');

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      setStatus('error');

      if (isRateLimitError(error.message)) {
        const cooldown = persistCooldown('rate-limit', RATE_LIMIT_COOLDOWN_SECONDS);
        setCooldownReason('rate-limit');
        setCooldownExpiresAt(cooldown?.expiresAt ?? 0);
        setCooldownNow(Date.now());
        setMessage(
          'Terlalu banyak permintaan email login telah dikirim. Mohon tunggu beberapa menit sebelum mencoba lagi.',
        );
        return;
      }

      setMessage(error.message || 'Gagal mengirim magic link.');
      return;
    }

    setStatus('success');
    const cooldown = persistCooldown('success', SUCCESS_COOLDOWN_SECONDS);
    setCooldownReason('success');
    setCooldownExpiresAt(cooldown?.expiresAt ?? 0);
    setCooldownNow(Date.now());
    setMessage('Magic link terkirim. Buka email Anda lalu lanjutkan login dari tautan tersebut.');
  }

  const isSubmitDisabled = status === 'loading' || cooldownSeconds > 0 || !envStatus.isConfigured;
  const buttonLabel =
    status === 'loading'
      ? 'Mengirim...'
      : cooldownSeconds > 0
        ? formatCooldownLabel(cooldownSeconds)
        : 'Kirim Magic Link';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-bold text-stone-700 dark:text-stone-300">
          Email Panitia
        </label>
        <div className="group relative">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 group-focus-within:text-pine">
            <Mail className="h-5 w-5 text-stone-400 transition-colors duration-300 group-focus-within:text-pine dark:text-stone-500 dark:group-focus-within:text-pine-400" />
          </div>
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@domainanda.com"
            required
            className="block w-full rounded-xl border border-stone-200/80 bg-stone-50/50 py-3.5 pl-12 pr-4 text-stone-900 placeholder:text-stone-400/70 transition-all duration-300 hover:border-stone-300 hover:bg-white focus:border-pine focus:bg-white focus:outline-none focus:ring-4 focus:ring-pine/10 dark:border-stone-700/80 dark:bg-stone-800/50 dark:text-stone-100 dark:placeholder:text-stone-500/70 dark:hover:border-stone-600 dark:hover:bg-stone-800 dark:focus:border-pine dark:focus:bg-stone-800 dark:focus:ring-pine/20"
          />
          <div className="pointer-events-none absolute bottom-1.5 left-4 right-4 h-[1.5px] origin-center scale-x-0 rounded-full bg-gradient-to-r from-pine/70 via-ember/60 to-pine/70 opacity-70 blur-[0.2px] transition-transform duration-300 ease-out group-focus-within:scale-x-100" />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitDisabled}
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-pine px-5 py-3.5 font-bold text-white shadow-lg shadow-pine/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-pine/30 active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-stone-300 disabled:shadow-none dark:bg-pine-600 dark:shadow-pine/20 dark:hover:shadow-pine/25 dark:disabled:bg-stone-700"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        
        {status === 'loading' ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <span className="relative">{buttonLabel}</span>
            <ArrowRight className="relative h-4 w-4 transition-all duration-300 group-hover:translate-x-1" />
          </>
        )}
      </button>

      {cooldownSeconds > 0 ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-stone-200/60 bg-stone-50/80 px-4 py-3 text-center text-xs text-stone-600 backdrop-blur-sm dark:border-stone-800/60 dark:bg-stone-800/50 dark:text-stone-400">
          <Timer className="h-4 w-4 text-amber-500" />
          <span>
            {cooldownReason === 'rate-limit'
              ? 'Batas kirim email sedang tercapai, tombol dikunci sementara.'
              : 'Magic link baru saja dikirim, tombol dikunci sementara.'}
            <span className="ml-1 font-bold text-amber-600">{formatCooldownLabel(cooldownSeconds)}</span>
          </span>
        </div>
      ) : null}

      {!envStatus.isConfigured ? (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200/60 bg-rose-50/80 px-4 py-3 text-xs font-semibold text-rose-700 backdrop-blur-sm dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{envStatus.message}. App menerima `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` atau kompatibel dengan `NEXT_PUBLIC_SUPABASE_ANON_KEY`.</span>
        </div>
      ) : null}

      {message && status !== 'loading' ? (
        <div
          className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm font-semibold shadow-sm backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
            status === 'error'
              ? 'border-rose-200/60 bg-rose-50/90 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300'
              : 'border-green-200/60 bg-green-50/90 text-green-700 dark:border-green-900/50 dark:bg-green-950/50 dark:text-green-300'
          }`}
        >
          {status === 'error' ? (
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
          )}
          <span>{message}</span>
        </div>
      ) : null}
    </form>
  );
}
