'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FolderOpen, X } from 'lucide-react';

import { deleteGroupAction, updateGroupAction } from '@/lib/actions';
import { GroupStatusBadge } from '@/components/dashboard/group-status-badge';

interface EditGroupModalProps {
  group: {
    id: string;
    name: string;
    animalType: 'cow' | 'goat' | 'sheep';
    status: 'open' | 'closed';
    pricePerSlot: number;
    notes: string | null;
    isFull: boolean;
    isUrgent: boolean;
    slotsLeft: number;
  } | null;
}

export function EditGroupModal({ group }: EditGroupModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modalRef = useRef<HTMLDivElement>(null);
  const isOpen = searchParams.get('modal') === 'edit' && searchParams.get('edit') === group?.id;

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
    params.delete('edit');

    const query = params.toString();
    router.push(query ? `/dashboard/groups?${query}` : '/dashboard/groups', { scroll: false });
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

  if (!group || !isOpen) return null;

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-group-modal-title"
    >
      <div className="panel max-h-[90vh] w-full max-w-2xl overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[color:var(--line-soft)] p-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">Edit Grup</p>
            <h2 id="edit-group-modal-title" className="mt-1 text-xl font-semibold text-pine dark:text-stone-100">
              {group.name}
            </h2>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">ID: {group.id}</p>
          </div>
          <button
            onClick={closeModal}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-500 transition hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={updateGroupAction} className="space-y-5 p-6">
          <input type="hidden" name="groupId" value={group.id} />

          <div className="panel-muted flex items-start justify-between gap-4 p-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ember/10 text-ember dark:bg-amber-900/30 dark:text-amber-200">
                <FolderOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-pine dark:text-stone-100">Perbarui detail grup</p>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                  Simpan perubahan data grup atau hapus grup jika batch ini sudah tidak digunakan.
                </p>
              </div>
            </div>
            <GroupStatusBadge
              status={group.status}
              isFull={group.isFull}
              isUrgent={group.isUrgent}
              slotsLeft={group.slotsLeft}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block">Nama grup</label>
              <input name="name" defaultValue={group.name} required />
            </div>

            <div className="form-grid">
              <div>
                <label className="mb-2 block">Jenis hewan</label>
                <select name="animalType" defaultValue={group.animalType}>
                  <option value="cow">Sapi</option>
                  <option value="goat">Kambing</option>
                  <option value="sheep">Domba</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block">Status</label>
                <select name="status" defaultValue={group.status}>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block">Harga per slot</label>
              <input type="number" name="pricePerSlot" min="1" defaultValue={group.pricePerSlot} required />
            </div>

            <div>
              <label className="mb-2 block">Catatan</label>
              <textarea name="notes" defaultValue={group.notes ?? ''} placeholder="Informasi lokasi, prioritas jamaah, atau catatan pembayaran" />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[color:var(--line-soft)] pt-5 sm:flex-row sm:justify-between">
            <button type="submit" formAction={deleteGroupAction} className="button-danger sm:w-auto">
              Hapus Grup
            </button>
            <div className="flex gap-3 sm:justify-end">
              <button type="button" onClick={closeModal} className="button-muted flex-1 sm:flex-none">
                Batal
              </button>
              <button type="submit" className="button-primary flex-1 sm:flex-none">
                Simpan Perubahan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
