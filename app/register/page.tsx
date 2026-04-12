import Link from 'next/link';

import { AppAlert } from '@/components/ui/app-alert';
import { PageHeader } from '@/components/ui/page-header';
import { submitPublicRegistration } from '@/lib/actions';
import { getPublicData } from '@/lib/services/qurban-service';
import { formatCurrency } from '@/lib/utils';
import { getAnimalLabel } from '@/lib/validation';

interface RegisterPageProps {
  searchParams: {
    groupId?: string;
    success?: string;
    error?: string;
  };
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { mosque, groups, availableGroups } = await getPublicData();
  const selectedGroupId = searchParams.groupId ?? availableGroups[0]?.id ?? '';

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <section className="space-y-6">
          <PageHeader
            eyebrow="Pendaftaran Mandiri"
            title="Amankan slot kurban Anda hari ini."
            description="Form ini hanya menampilkan grup yang masih terbuka. Setelah submit, slot langsung dicatat ke database agar validasi kapasitas dan status grup tetap konsisten untuk jamaah dan panitia."
          />

          {searchParams.success ? (
            <AppAlert tone="success">{searchParams.success}</AppAlert>
          ) : null}
          {searchParams.error ? (
            <AppAlert tone="error">{searchParams.error}</AppAlert>
          ) : null}

          <form action={submitPublicRegistration} className="panel space-y-6 p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="eyebrow">Form Jamaah</p>
                <h2 className="mt-2 text-2xl font-semibold text-pine dark:text-stone-100">Isi data pendaftaran</h2>
              </div>
              <div className="w-full rounded-[22px] border border-amber-100 bg-sand px-4 py-3 text-sm leading-6 text-stone-700 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-stone-200 sm:w-auto sm:max-w-xs">
                Verifikasi pembayaran tetap dilakukan manual oleh panitia.
              </div>
            </div>

            <div className="form-grid gap-5">
              <div className="sm:col-span-2">
                <label className="mb-2 block">Pilih grup kurban</label>
                <select name="groupId" defaultValue={selectedGroupId} required>
                  {availableGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} - {getAnimalLabel(group.animalType)} - Tersisa {group.slotsLeft} slot
                    </option>
                  ))}
                </select>
                <p className="helper-text">Hanya grup yang masih terbuka dan belum penuh yang tampil di daftar ini.</p>
              </div>
              <div>
                <label className="mb-2 block">Nama lengkap</label>
                <input name="fullName" placeholder="Contoh: Muhammad Iqbal" required />
              </div>
              <div>
                <label className="mb-2 block">Nomor WhatsApp</label>
                <input name="phone" placeholder="08xxxxxxxxxx" required />
              </div>
              <div>
                <label className="mb-2 block">Domisili</label>
                <input name="city" placeholder="Jakarta Selatan" required />
              </div>
              <div>
                <label className="mb-2 block">Kontak panitia</label>
                <input value={mosque.contactPhone} disabled />
                <p className="helper-text">Gunakan nomor ini untuk konfirmasi transfer atau pertanyaan lanjutan.</p>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block">Catatan tambahan</label>
                <textarea
                  name="notes"
                  placeholder="Contoh: atas nama keluarga, butuh kuitansi, atau jadwal pelunasan"
                />
              </div>
            </div>

            <div className="rounded-[24px] border border-amber-100 bg-sand p-4 text-sm leading-7 text-stone-700 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-stone-200 sm:p-5">
              <p className="font-semibold text-pine dark:text-gold">Informasi penting</p>
              <ul className="mt-2 space-y-1">
                <li>Sapi maksimal 7 peserta per grup.</li>
                <li>Kambing dan domba hanya 1 peserta per hewan.</li>
                <li>Pembayaran masih diproses manual oleh panitia.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button type="submit" className="button-primary w-full justify-center sm:w-auto">
                Kirim Pendaftaran
              </button>
              <Link href="/" className="button-secondary w-full justify-center sm:w-auto">
                Kembali ke Beranda
              </Link>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <div className="panel bg-pine p-5 text-white dark:bg-[linear-gradient(180deg,rgba(24,54,43,0.96)_0%,rgba(14,28,21,0.98)_100%)] sm:p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-gold">Ringkasan program</p>
            <h2 className="mt-3 font-serif-display text-3xl sm:text-4xl">{mosque.name}</h2>
            <p className="mt-3 text-sm leading-7 text-white/80">
              Deadline pendaftaran {mosque.registrationDeadline}. Setelah mendaftar, panitia akan melakukan verifikasi
              pembayaran manual melalui WhatsApp.
            </p>
            <div className="mt-5 rounded-[24px] bg-white/10 p-4 text-sm leading-6 text-white/85 break-words">{mosque.bankInfo}</div>
          </div>

          <div className="panel space-y-4 p-5 sm:p-6">
            <h3 className="text-xl font-semibold text-pine dark:text-stone-100">Slot yang masih tersedia</h3>
            <div className="space-y-3">
              {availableGroups.map((group) => (
                <div key={group.id} className="rounded-[24px] border border-stone-100 px-4 py-4 dark:border-stone-800">
                  <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-pine dark:text-stone-100">{group.name}</p>
                      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{getAnimalLabel(group.animalType)}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        group.slotsLeft <= 2
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300'
                          : 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300'
                      }`}
                    >
                      Tersisa {group.slotsLeft} slot
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm text-stone-600 dark:text-stone-300">
                    <span>
                      {group.filledSlots}/{group.capacity} terisi
                    </span>
                    <span className="font-semibold text-pine dark:text-stone-100">{formatCurrency(group.pricePerSlot)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel space-y-4 p-5 sm:p-6">
            <h3 className="text-xl font-semibold text-pine dark:text-stone-100">Grup yang sudah penuh</h3>
            <div className="space-y-3 text-sm text-stone-600 dark:text-stone-300">
              {groups
                .filter((group) => group.isFull)
                .map((group) => (
                  <div key={group.id} className="rounded-[22px] bg-stone-50 px-4 py-3 dark:bg-stone-900/80">
                    {group.name} - {getAnimalLabel(group.animalType)}
                  </div>
                ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
