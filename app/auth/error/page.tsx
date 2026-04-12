import Link from 'next/link';

const errorMessages: Record<string, string> = {
  unauthorized: 'Email Anda berhasil terautentikasi, tetapi belum memiliki record staff aktif untuk akses dashboard.',
  admin_required: 'Akun Anda valid untuk dashboard, tetapi hanya role admin yang bisa membuka halaman atau aksi manajemen staff.',
  callback_failed: 'Supabase gagal menukar magic link menjadi sesi login aktif.',
  missing_code: 'Tautan login tidak membawa kode autentikasi yang dibutuhkan.',
  staff_table_missing: 'Tabel staff_users belum tersedia di Supabase. Jalankan migration SQL dan seed bootstrap terlebih dahulu.',
};

interface AuthErrorPageProps {
  searchParams: {
    reason?: string;
  };
}

export default function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const message = errorMessages[searchParams.reason ?? ''] ?? 'Terjadi kesalahan autentikasi yang tidak dikenali.';

  return (
    <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <section className="card space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ember">Akses Ditolak</p>
          <h1 className="mt-2 font-serif-display text-4xl text-pine dark:text-stone-100">Login belum bisa melanjutkan ke dashboard</h1>
          <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-300">{message}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/auth/login" className="button-primary">
            Kembali ke Login
          </Link>
          <Link href="/" className="button-secondary">
            Kembali ke Beranda
          </Link>
        </div>
      </section>
    </main>
  );
}
