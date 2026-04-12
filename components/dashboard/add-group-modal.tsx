'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, FolderOpen } from 'lucide-react';
import { createGroupAction } from '@/lib/actions';

export function AddGroupModal() {
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
    router.push(`/dashboard/groups?${params.toString()}`, { scroll: false });
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">Grup Baru</p>
            <h2 id="modal-title" className="mt-1 text-xl font-semibold text-pine dark:text-stone-100">
              Tambah Grup Baru
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

        <form action={createGroupAction} className="space-y-5 p-6">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block">Nama grup</label>
              <input name="name" placeholder="Contoh: Sapi D - Komunitas Alumni" required />
            </div>
            <div className="form-grid">
              <div>
                <label className="mb-2 block">Jenis hewan</label>
                <select name="animalType" defaultValue="cow">
                  <option value="cow">Sapi</option>
                  <option value="goat">Kambing</option>
                  <option value="sheep">Domba</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block">Status</label>
                <select name="status" defaultValue="open">
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-2 block">Harga per slot</label>
              <input type="number" name="pricePerSlot" min="1" placeholder="2850000" required />
            </div>
            <div>
              <label className="mb-2 block">Catatan</label>
              <textarea name="notes" placeholder="Informasi lokasi, prioritas jamaah, atau catatan pembayaran" />
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
              Simpan Grup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
