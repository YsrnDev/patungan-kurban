import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, MailCheck, Sparkles } from 'lucide-react';

import { LoginForm } from '@/components/auth/login-form';
import { LogoutButton } from '@/components/auth/logout-button';
import { BrandLogo } from '@/components/brand-logo';
import { AppAlert } from '@/components/ui/app-alert';
import { getCurrentAuthContext } from '@/lib/auth';
import { resolveLoginFlash } from '@/lib/flash';
import { getSupabasePublicEnvStatus } from '@/lib/supabase/config';

const COPYRIGHT_YEAR = 2026;

interface LoginPageProps {
  searchParams: {
    next?: string;
    error?: string;
  };
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const nextPath = searchParams.next?.startsWith('/') ? searchParams.next : '/dashboard';
  const supabaseEnv = getSupabasePublicEnvStatus();
  const { user, staffUser, authErrorReason } = await getCurrentAuthContext();
  const errorFlash = resolveLoginFlash(searchParams.error);

  if (user && staffUser?.isActive) {
    redirect(nextPath);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-sand px-4 py-8 dark:bg-stone-950 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-pine/10 blur-[120px] animate-pulse" />
        <div className="absolute -right-1/4 -bottom-1/4 h-[500px] w-[500px] rounded-full bg-ember/10 blur-[100px] animate-pulse delay-1000" />
        <div className="absolute left-1/3 top-1/2 h-[300px] w-[300px] rounded-full bg-pine-300/10 blur-[80px] animate-pulse delay-700" />
      </div>

      <div className="relative w-full max-w-[440px]">
        <div className="group relative">
          <div className="absolute -inset-[1px] rounded-[20px] bg-gradient-to-r from-pine via-ember to-pine bg-[length:200%_100%] opacity-70 blur-[2px] transition-all duration-500 group-hover:opacity-100 group-hover:blur-[3px] animate-gradient-x" />
          
          <div className="relative rounded-[19px] border border-stone-200/40 bg-white/95 shadow-2xl shadow-stone-900/5 backdrop-blur-xl dark:border-stone-800/40 dark:bg-stone-900/95 dark:shadow-black/40">
            <section className="p-7 sm:p-9">
              <div className="mb-8 text-center">
                <div className="mb-5 flex justify-center">
                  <div className="brand-logo-link flex min-w-0 items-center gap-3 text-left">
                    <BrandLogo
                      priority
                      markClassName="h-10 w-10 rounded-xl shadow-md sm:h-11 sm:w-11"
                      eyebrowClassName="text-[11px] tracking-[0.28em] text-ember sm:text-xs"
                      titleClassName="text-sm font-semibold text-pine dark:text-stone-100"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-stone-400 dark:text-stone-500">
                  <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                  <p className="text-xs font-bold uppercase tracking-[0.15em]">
                    Login Panitia
                  </p>
                  <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                </div>
              </div>

              {errorFlash ? (
                <div className="mb-5">
                  <AppAlert tone={errorFlash.tone}>{errorFlash.message}</AppAlert>
                </div>
              ) : null}

              {!supabaseEnv.isConfigured ? (
                <div className="mb-5 rounded-xl border border-rose-200/60 bg-rose-50/80 p-4 text-sm text-rose-700 backdrop-blur-sm dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                  <p className="font-semibold">Konfigurasi Supabase belum lengkap</p>
                  <p className="mt-1 text-xs text-rose-600/80 dark:text-rose-400/80">{supabaseEnv.message}</p>
                </div>
              ) : null}

              {authErrorReason === 'staff_table_missing' ? (
                <div className="mb-5 rounded-xl border border-amber-200/60 bg-amber-50/80 p-4 text-sm text-amber-800 backdrop-blur-sm dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                  <p className="font-semibold">Tabel staff belum tersedia</p>
                  <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-400/80">
                    Migration SQL staff_users belum dijalankan.
                  </p>
                </div>
              ) : null}

              {user && !staffUser && authErrorReason !== 'staff_table_missing' ? (
                <div className="mb-5 rounded-xl border border-amber-200/60 bg-amber-50/80 p-4 text-sm backdrop-blur-sm dark:border-amber-900/50 dark:bg-amber-950/30">
                  <div className="flex items-start gap-3">
                    <MailCheck className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="font-semibold text-amber-800 dark:text-amber-200">Akun belum diizinkan</p>
                      <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-400/80">
                        {user.email} belum memiliki akses staff.
                      </p>
                      <div className="mt-3">
                        <LogoutButton className="rounded-lg border border-amber-300/70 bg-white/80 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-all hover:bg-amber-100 hover:shadow-sm dark:border-amber-800 dark:bg-stone-800 dark:text-amber-300 dark:hover:bg-amber-900/30" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <LoginForm nextPath={nextPath} defaultEmail={user?.email ?? ''} />

              <div className="mt-8 flex flex-col items-center gap-4 border-t border-stone-200/60 pt-6 text-center dark:border-stone-800/60">
                <Link
                  href="/"
                  className="group/link inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition-all hover:text-pine hover:gap-3 dark:text-stone-400 dark:hover:text-stone-100"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover/link:-translate-x-1" />
                  Kembali ke beranda
                </Link>
                <p className="text-xs font-medium text-stone-400 dark:text-stone-600">
                  © {COPYRIGHT_YEAR} Patungan Kurban. Semua hak cipta dilindungi.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
