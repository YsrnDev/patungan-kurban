# Patungan Kurban

Aplikasi web patungan kurban berbasis Next.js untuk alur publik dan operasional panitia. Saat ini aplikasi sudah memakai Supabase untuk autentikasi staff via magic link, penyimpanan data qurban, otorisasi staff, serta mendukung PWA untuk pengalaman installable di perangkat mobile.

## Gambaran aplikasi saat ini

- Landing page publik di `app/page.tsx` sudah aktif dengan hero, ringkasan metrik, daftar grup, indikator slot urgent, dan status grup penuh agar transparansi tetap terjaga.
- Halaman pendaftaran mandiri di `app/register/page.tsx` hanya menampilkan grup yang masih terbuka dan belum penuh.
- Dashboard staff di `app/dashboard/page.tsx` sudah aktif untuk overview operasional.
- Manajemen grup tersedia di `app/dashboard/groups/page.tsx`.
- Manajemen peserta dan perpindahan grup tersedia di `app/dashboard/participants/page.tsx`.
- Manajemen staff tersedia di `app/dashboard/staff/page.tsx` dan dibatasi untuk role `admin`.
- Viewer audit log admin tersedia di `app/dashboard/audit/page.tsx`.
- Laporan operasional tersedia di `app/dashboard/reports/page.tsx`, termasuk export Excel dan PDF.

## Tech stack

- Next.js 14 App Router
- React 18 + TypeScript
- Tailwind CSS
- Supabase Auth untuk login staff via magic link
- Supabase Postgres untuk data qurban dan otorisasi `staff_users`
- `@supabase/ssr` untuk session client/server + middleware
- `xlsx` dan `pdf-lib` untuk export laporan
- GSAP untuk animasi landing page

## Supabase auth dan data

Implementasi saat ini sudah memindahkan login dan data utama ke Supabase:

- Staff login memakai `supabase.auth.signInWithOtp()` dari browser.
- Magic link mengarah ke `app/auth/callback/route.ts` untuk menukar `code` menjadi session cookie.
- Middleware `middleware.ts` + `lib/supabase/middleware.ts` menjaga session dan proteksi route dashboard.
- Otorisasi staff dibaca dari tabel `public.staff_users`.
- Data bisnis qurban dibaca dan ditulis ke PostgreSQL Supabase, bukan file lokal runtime.
- Mutasi penting seperti registrasi peserta dan pindah grup memakai fungsi SQL terpusat dengan capacity check dan locking untuk mengurangi risiko overbooking.
- Server actions dan service layer tetap dipakai agar flow UI publik dan dashboard tetap konsisten.

Role yang saat ini didukung:

- `admin`
- `panitia`

Aturan akses utama:

- `admin` dan `panitia` dapat membuka `/dashboard`, `/dashboard/groups`, `/dashboard/participants`, dan `/dashboard/reports`.
- Hanya `admin` yang dapat membuka `/dashboard/staff`.
- Hanya `admin` yang dapat membuka `/dashboard/staff` dan `/dashboard/audit`.
- User yang berhasil login di Supabase Auth tetapi tidak aktif atau tidak ada di `staff_users` tetap ditolak di layer aplikasi.

## Catatan penting migration Supabase

Sebelum dashboard staff bisa dipakai penuh, jalankan migration berikut secara berurutan pada project Supabase yang sama dengan environment aplikasi:

- `supabase/migrations/0001_staff_users.sql`
- `supabase/migrations/0002_qurban_data.sql`
- `supabase/migrations/0003_qurban_seed.sql`
- `supabase/migrations/0004_audit_logs.sql`

Migration tersebut mencakup hal penting berikut:

- pembuatan enum role `app_role` (`admin`, `panitia`)
- tabel `public.staff_users`
- tabel domain `public.mosque_profiles`, `public.qurban_groups`, dan `public.qurban_participants`
- trigger `updated_at`
- RLS dan policy dasar untuk pembacaan record staff milik sendiri
- fungsi SQL terpusat untuk registrasi peserta, pindah grup, CRUD grup, dan delete peserta
- unique index untuk mencegah duplikasi peserta per grup berdasarkan nomor telepon yang dinormalisasi
- seed data awal qurban dan bootstrap admin contoh

Langkah bootstrap yang tetap wajib diperhatikan:

1. Tentukan satu email admin nyata yang benar-benar bisa menerima magic link.
2. Jalankan `0001_staff_users.sql`, `0002_qurban_data.sql`, lalu `0003_qurban_seed.sql` secara berurutan.
3. Jika perlu, ubah seed email admin contoh sebelum migration dijalankan.
4. Pastikan environment aplikasi berisi URL Supabase, key publik, dan `SUPABASE_SERVICE_ROLE_KEY`.
5. Login pertama kali memakai email admin nyata tersebut agar user auth Supabase terbentuk.
6. Tambahkan staff lain melalui `/dashboard/staff`.

Catatan setup SQL yang tetap relevan:

- `0002_qurban_data.sql` berisi schema, constraint, RLS, trigger, helper function, dan RPC SQL domain qurban.
- `0003_qurban_seed.sql` aman dijalankan ulang karena memakai `on conflict` untuk update seed/backfill.
- App membaca data qurban via `lib/data/qurban-repository.ts` menggunakan service role di sisi server.
- Jika migration belum dijalankan, login tetap bisa mengirim magic link tetapi akses dashboard akan gagal aman dengan error `staff_table_missing`.
- Jika `0004_audit_logs.sql` belum dijalankan, dashboard audit tetap bisa dibuka oleh admin dan akan menampilkan notice bahwa tabel `audit_logs` belum tersedia.
- Jika email bootstrap contoh tidak valid untuk inbox nyata, ubah seed migration atau insert manual record `staff_users` sebelum login pertama.

## PWA yang sudah diimplementasikan

Support PWA sudah aktif dan terdiri dari:

- manifest di `public/manifest.webmanifest`
- service worker di `public/sw.js`
- registrasi service worker via `components/pwa-register.tsx` pada production build
- install prompt khusus via `components/pwa-install-prompt.tsx`
- splash screen standalone via `components/pwa-launch-splash.tsx`
- metadata icon dan manifest di `app/layout.tsx`

Perilaku saat ini:

- aplikasi dapat dipasang dari browser yang mendukung `beforeinstallprompt`
- prompt install dapat ditunda dan disembunyikan sementara dengan penyimpanan local state di browser
- saat dibuka dalam mode standalone, splash screen ringan ditampilkan beberapa detik
- service worker melakukan precache aset dasar PWA dan cache runtime untuk navigasi/aset statis

## Perbaikan login magic link

Form login staff di `components/auth/login-form.tsx` saat ini sudah memiliki cooldown yang lebih ramah:

- cooldown 45 detik setelah magic link berhasil dikirim
- cooldown 5 menit saat Supabase mengembalikan error rate limit
- status cooldown disimpan di `localStorage` agar tidak mudah di-spam saat reload halaman
- tombol submit dikunci sementara dan pesan feedback ditampilkan lebih jelas

## Struktur proyek yang paling penting

- `app/` route App Router untuk halaman publik, auth, dashboard, dan API route
- `components/` komponen UI, dashboard, auth, animasi, dan PWA
- `lib/actions.ts` server actions untuk pendaftaran publik dan mutasi dashboard
- `lib/auth.ts` helper auth dan otorisasi dashboard
- `lib/services/qurban-service.ts` service layer domain qurban
- `lib/services/staff-user-service.ts` service layer otorisasi staff
- `lib/services/report-service.ts` agregasi data laporan dashboard
- `lib/data/qurban-repository.ts` akses data Supabase server-side
- `lib/supabase/` client browser/server/middleware/admin
- `supabase/migrations/` migration schema, auth support, dan seed awal
- `public/icons/` ikon PWA yang sudah dipakai manifest dan metadata
- `public/img/hero.webp` aset hero landing page

## Environment variables

Simpan di `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Fallback kompatibel yang masih diterima:

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Catatan:

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` adalah key publik utama yang dipakai aplikasi.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` tetap didukung sebagai fallback kompatibilitas.
- `SUPABASE_SERVICE_ROLE_KEY` dipakai untuk akses server-side ke repository data dan otorisasi staff.
- Supabase Site URL dan redirect URL harus mengizinkan callback ke `/auth/callback`.
- Setelah mengubah env publik, restart server dev/build Next.js.

## Menjalankan lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

Untuk verifikasi lokal yang umum dipakai:

```bash
npm run build
```

## Catatan aset dan ikon

- Ikon PWA yang sedang dipakai ada di `public/icons/icon-192.png` dan `public/icons/icon-512.png`.
- Gambar hero landing page ada di `public/img/hero.webp`.
- Jika ikon diganti, perbarui file ikon dan pastikan `public/manifest.webmanifest` serta metadata di `app/layout.tsx` tetap sinkron.

## Status implementasi singkat

Yang sudah ada sekarang:

- alur publik untuk melihat slot dan daftar mandiri
- dashboard panitia dengan proteksi auth + role
- CRUD grup dan peserta
- perpindahan peserta antar grup
- manajemen staff admin/panitia
- laporan operasional + export Excel/PDF
- PWA installable dengan splash standalone

Limitasi yang masih relevan:

- pembayaran masih diverifikasi manual oleh panitia
- audit log viewer admin membutuhkan migration `0004_audit_logs.sql` di project Supabase aktif
- sinkronisasi lifecycle `auth.users` dan `staff_users` masih sederhana
- mutasi dashboard masih mengandalkan server action + auth layer aplikasi, bukan client browser langsung ke RLS untuk admin workflow
