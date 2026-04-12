'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Users, PlusCircle } from 'lucide-react';
import { addParticipantAction } from '@/lib/actions';

interface AddParticipantModalProps {
  openGroups: Array<{
    id: string;
    name: string;
    slotsLeft: number;
  }>;
  hasGroups: boolean;
  hasOpenGroups: boolean;
}

export function AddParticipantModal({ openGroups, hasGroups, hasOpenGroups }: AddParticipantModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modalRef = useRef<HTMLDivElement>(null);
  const isOpen = searchParams.get('modal') === 'add';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const closeModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('modal');
    router.push(`/dashboard/participants?${params.toString()}`, { scroll: false });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      closeModal();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="panel w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[color:var(--line-soft)] p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">Input Manual</p>
            <h2 id="modal-title" className="mt-1 text-xl font-semibold text-pine dark:text-stone-100">
              Tambah Peserta
            </h2>
          </div>
          <button
            onClick={closeModal}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-500 transition hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={addParticipantAction} className="space-y-5 p-6">
          {!hasGroups ? (
            <div className="info-card">
              <div className="flex items-start gap-3">
                <PlusCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-200">Belum ada grup</p>
                  <p className="mt-1 text-sm text-amber-800/80 dark:text-amber-300/80">
                    Buat grup terlebih dahulu sebelum menambahkan peserta.
                  </p>
                </div>
              </div>
            </div>
          ) : !hasOpenGroups ? (
            <div className="info-card">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-200">Semua grup penuh</p>
                  <p className="mt-1 text-sm text-amber-800/80 dark:text-amber-300/80">
                    Tidak ada grup dengan slot tersedia. Buat grup baru atau update status grup.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="space-y-4">
            <div>
              <label className="mb-2 block">Pilih grup</label>
              <select name="groupId" required disabled={!hasOpenGroups}>
                {hasOpenGroups ? (
                  openGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} - tersisa {group.slotsLeft} slot
                    </option>
                  ))
                ) : (
                  <option value="">Tidak ada grup tersedia</option>
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block">Nama lengkap</label>
              <input
                name="fullName"
                placeholder="Contoh: Keluarga Anwar"
                required
                disabled={!hasOpenGroups}
              />
            </div>

            <div className="form-grid">
              <div>
                <label className="mb-2 block">Nomor WhatsApp</label>
                <input name="phone" placeholder="08xxxxxxxxxx" required disabled={!hasOpenGroups} />
              </div>
              <div>
                <label className="mb-2 block">Domisili</label>
                <input name="city" placeholder="Jakarta Selatan" required disabled={!hasOpenGroups} />
              </div>
            </div>

            <div>
              <label className="mb-2 block">Status pembayaran</label>
              <select name="paymentStatus" defaultValue="pending" disabled={!hasOpenGroups}>
                <option value="pending">Menunggu</option>
                <option value="partial">DP</option>
                <option value="paid">Lunas</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block">Catatan</label>
              <textarea
                name="notes"
                placeholder="Catatan follow up, kuitansi, atau pembayaran"
                disabled={!hasOpenGroups}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="info-card text-sm">
            Isi catatan singkat yang membantu operasional, misalnya status kuitansi, janji transfer, atau permintaan pindah grup.
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="button-muted flex-1"
            >
              Batal
            </button>
            <button type="submit" className="button-primary flex-1" disabled={!hasOpenGroups}>
              Tambahkan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
