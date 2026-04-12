'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Shield, Users, AlertCircle } from 'lucide-react';
import { createStaffUserAction } from '@/lib/actions';

export function AddStaffModal() {
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
    router.push(`/dashboard/staff?${params.toString()}`, { scroll: false });
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">Staff Baru</p>
            <h2 id="modal-title" className="mt-1 text-xl font-semibold text-pine dark:text-stone-100">
              Tambah Staff
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

        <form action={createStaffUserAction} className="space-y-5 p-6">
          <div className="space-y-4">
            <div>
              <label className="mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-stone-500" />
                Email staff
              </label>
              <input name="email" type="email" placeholder="panitia@masjidnurulhuda.id" required />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-stone-500" />
                Nama tampil
              </label>
              <input name="fullName" placeholder="Contoh: Panitia Kurban 1" />
            </div>

            <div>
              <label className="mb-2 block">Role</label>
              <select name="role" defaultValue="panitia">
                <option value="admin">Admin</option>
                <option value="panitia">Panitia</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block">Catatan</label>
              <textarea
                name="notes"
                placeholder="Catatan penugasan, PIC lapangan, atau informasi internal"
              />
            </div>
          </div>

          <div className="info-card">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-amber-800/80 dark:text-amber-300/80">
                Pastikan email ini juga digunakan saat menerima magic link login agar proses autentikasi tidak terhambat.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="button-muted flex-1"
            >
              Batal
            </button>
            <button type="submit" className="button-primary flex-1">
              Simpan Staff User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
