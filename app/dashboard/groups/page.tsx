import Link from 'next/link';
import { ChevronDown, FolderOpen, Pencil, Plus } from 'lucide-react';

import { AppAlert } from '@/components/ui/app-alert';
import { EmptyState } from '@/components/dashboard/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { AddGroupModal } from '@/components/dashboard/add-group-modal';
import { createGroupAction, deleteGroupAction, updateGroupAction } from '@/lib/actions';
import { requireOperationalUser } from '@/lib/auth';
import { getDashboardData } from '@/lib/services/qurban-service';
import { formatCurrency } from '@/lib/utils';
import { getAnimalLabel } from '@/lib/validation';

interface GroupsPageProps {
  searchParams: {
    edit?: string;
    success?: string;
    error?: string;
    modal?: string;
  };
}

export default async function GroupsPage({ searchParams }: GroupsPageProps) {
  await requireOperationalUser({ next: '/dashboard/groups' });
  const { groups } = await getDashboardData();
  const selectedGroup = searchParams.edit ? groups.find((group) => group.id === searchParams.edit) : null;

  const hasGroups = groups.length > 0;

  return (
    <div className="section-gap-md">
      <PageHeader
        eyebrow="Manajemen Grup"
        title="Kelola batch hewan dengan struktur yang lebih ringkas"
        description="Kelola grup hewan kurban, pantau kapasitas, dan perbarui informasi dengan mudah."
      />

      {searchParams.success ? (
        <AppAlert tone="success">{searchParams.success}</AppAlert>
      ) : null}
      {searchParams.error ? (
        <AppAlert tone="error">{searchParams.error}</AppAlert>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ember/10 text-ember dark:bg-amber-900/30 dark:text-amber-200">
            <FolderOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-stone-500 dark:text-stone-400">Total Grup</p>
            <p className="text-2xl font-bold text-pine dark:text-stone-100">{groups.length}</p>
          </div>
        </div>

        <Link
          href="/dashboard/groups?modal=add"
          className="button-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Tambah Grup
        </Link>
      </div>

      <section className="table-shell">
        <div className="table-toolbar">
          <div className="table-toolbar-title">
            <div className="table-toolbar-icon bg-ember/10 text-ember dark:bg-amber-900/30 dark:text-amber-200">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="section-eyebrow">Daftar Grup</p>
              <h2 className="section-title mt-1">Kelola batch hewan</h2>
            </div>
          </div>
          <span className="table-toolbar-meta">{groups.length} grup aktif</span>
        </div>

        {hasGroups ? (
          <>
            <div className="hidden border-b border-stone-200/80 px-5 py-5 dark:border-stone-800 lg:block">
              {selectedGroup ? (
                <form action={updateGroupAction} className="panel-muted space-y-4 p-5">
                  <input type="hidden" name="groupId" value={selectedGroup.id} />

                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="section-eyebrow">Edit Grup</p>
                      <h3 className="section-title mt-1">{selectedGroup.name}</h3>
                      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">ID: {selectedGroup.id}</p>
                    </div>
                    <StatusBadge
                      label={selectedGroup.isFull ? 'Penuh' : selectedGroup.status === 'closed' ? 'Ditutup' : `Tersisa ${selectedGroup.slotsLeft} slot`}
                      tone={selectedGroup.isFull ? 'muted' : selectedGroup.isUrgent ? 'danger' : selectedGroup.status === 'closed' ? 'warning' : 'success'}
                    />
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <div>
                      <label className="mb-2 block">Nama grup</label>
                      <input name="name" defaultValue={selectedGroup.name} required />
                    </div>
                    <div>
                      <label className="mb-2 block">Harga per slot</label>
                      <input type="number" name="pricePerSlot" min="1" defaultValue={selectedGroup.pricePerSlot} required />
                    </div>
                    <div>
                      <label className="mb-2 block">Jenis hewan</label>
                      <select name="animalType" defaultValue={selectedGroup.animalType}>
                        <option value="cow">Sapi</option>
                        <option value="goat">Kambing</option>
                        <option value="sheep">Domba</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block">Status</label>
                      <select name="status" defaultValue={selectedGroup.status}>
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block">Catatan</label>
                    <textarea name="notes" defaultValue={selectedGroup.notes ?? ''} placeholder="Informasi lokasi, prioritas jamaah, atau catatan pembayaran" />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button type="submit" className="button-primary">Simpan Perubahan</button>
                    <button type="submit" formAction={deleteGroupAction} className="button-danger">Hapus Grup</button>
                    <Link href="/dashboard/groups" className="button-secondary">Batal</Link>
                  </div>
                </form>
              ) : (
                <div className="panel-muted flex items-center justify-between gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <p className="section-eyebrow">Edit Grup</p>
                    <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Pilih tombol Edit pada salah satu grup untuk membuka panel perubahan tanpa meninggalkan halaman ini.</p>
                  </div>
                  <p className="shrink-0 text-xs text-stone-500 dark:text-stone-400">Update dan hapus tetap diproses lewat aksi yang sama.</p>
                </div>
              )}
            </div>

            <div className="hidden lg:block">
              <div className="table-scroll">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>Grup</th>
                      <th>Jenis & Harga</th>
                      <th>Kapasitas</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((group) => (
                      <tr key={group.id}>
                        <td>
                          <p className="font-semibold text-pine dark:text-stone-100">{group.name}</p>
                          <p className="font-mono text-xs text-stone-500 dark:text-stone-400">{group.id}</p>
                          {group.notes ? <p className="mt-1 max-w-[200px] truncate text-xs text-stone-500 dark:text-stone-400" title={group.notes}>{group.notes}</p> : null}
                        </td>
                        <td>
                          <p className="text-sm font-medium text-stone-700 dark:text-stone-200">{getAnimalLabel(group.animalType)}</p>
                          <p className="text-xs text-stone-500 dark:text-stone-400">{formatCurrency(group.pricePerSlot)} / slot</p>
                        </td>
                        <td>
                          <div className="w-28">
                            <div className="progress-track">
                              <div
                                className={`progress-bar ${group.isUrgent ? 'progress-bar-ember' : group.isFull ? 'progress-bar-stone' : 'progress-bar-palm'}`}
                                style={{ width: `${(group.filledSlots / group.capacity) * 100}%` }}
                              />
                            </div>
                            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{group.filledSlots} / {group.capacity}</p>
                          </div>
                        </td>
                        <td>
                          <StatusBadge
                            label={group.isFull ? 'Penuh' : group.status === 'closed' ? 'Ditutup' : `Tersisa ${group.slotsLeft} slot`}
                            tone={group.isFull ? 'muted' : group.isUrgent ? 'danger' : group.status === 'closed' ? 'warning' : 'success'}
                          />
                        </td>
                        <td>
                          <Link
                            href={`/dashboard/groups?edit=${group.id}`}
                            className={`text-sm font-semibold ${selectedGroup?.id === group.id ? 'text-pine dark:text-gold' : 'text-palm hover:text-pine dark:text-gold dark:hover:text-amber-200'}`}
                          >
                            {selectedGroup?.id === group.id ? 'Sedang diedit' : 'Edit'}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3 p-4 sm:p-5 lg:hidden">
              {selectedGroup ? (
                <form action={updateGroupAction} className="list-row list-row-compact space-y-4 border border-amber-200/70 bg-amber-50/80 sm:p-5 dark:border-amber-900/40 dark:bg-amber-950/10">
                  <input type="hidden" name="groupId" value={selectedGroup.id} />

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ember">Edit grup</p>
                      <h3 className="mt-1 text-lg font-semibold text-pine dark:text-stone-100">{selectedGroup.name}</h3>
                      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{selectedGroup.id}</p>
                    </div>
                    <Link href="/dashboard/groups" className="button-secondary px-4 py-2 text-xs">
                      Tutup
                    </Link>
                  </div>

                  <div className="form-grid">
                    <div>
                      <label className="mb-2 block">Nama grup</label>
                      <input name="name" defaultValue={selectedGroup.name} className="text-sm" required />
                    </div>
                    <div>
                      <label className="mb-2 block">Harga per slot</label>
                      <input type="number" name="pricePerSlot" min="1" defaultValue={selectedGroup.pricePerSlot} className="text-sm" required />
                    </div>
                    <div>
                      <label className="mb-2 block">Jenis hewan</label>
                      <select name="animalType" defaultValue={selectedGroup.animalType} className="text-sm">
                        <option value="cow">Sapi</option>
                        <option value="goat">Kambing</option>
                        <option value="sheep">Domba</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block">Status</label>
                      <select name="status" defaultValue={selectedGroup.status} className="text-sm">
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block">Catatan</label>
                    <textarea name="notes" defaultValue={selectedGroup.notes ?? ''} placeholder="Informasi lokasi, prioritas jamaah, atau catatan pembayaran" />
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <button type="submit" className="button-primary w-full text-xs px-3 py-2 sm:w-auto">Simpan Perubahan</button>
                    <button type="submit" formAction={deleteGroupAction} className="button-danger w-full text-xs px-3 py-2 sm:w-auto">Hapus Grup</button>
                  </div>
                </form>
              ) : null}

              {groups.map((group) => (
                <article key={group.id} className="list-row list-row-compact space-y-2 px-3 py-2.5 sm:space-y-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-pine dark:text-stone-100">{group.name}</p>
                      <p className="mt-0.5 text-[10px] font-mono text-stone-300 dark:text-stone-600">{group.id.slice(0, 8)}...</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
                        <span className="inline-flex items-center rounded-md bg-sand px-1.5 py-0.5 dark:bg-stone-900/80">{getAnimalLabel(group.animalType)}</span>
                        <span className="text-stone-300 dark:text-stone-600">•</span>
                        <span>{formatCurrency(group.pricePerSlot)}</span>
                      </div>
                    </div>
                    <StatusBadge
                      label={group.isFull ? 'Penuh' : group.status === 'closed' ? 'Ditutup' : `${group.slotsLeft} slot`}
                      tone={group.isFull ? 'muted' : group.isUrgent ? 'danger' : group.status === 'closed' ? 'warning' : 'success'}
                      className="shrink-0 text-[10px]"
                    />
                  </div>

                  <div className="rounded-xl bg-sand px-3 py-2 dark:bg-stone-900/80">
                    <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">
                      <span>Kapasitas</span>
                      <span>{group.filledSlots}/{group.capacity}</span>
                    </div>
                    <div className="progress-track mt-1.5 h-1.5 bg-white dark:bg-stone-800">
                      <div
                        className={`progress-bar ${group.isUrgent ? 'progress-bar-ember' : group.isFull ? 'progress-bar-stone' : 'progress-bar-palm'}`}
                        style={{ width: `${(group.filledSlots / group.capacity) * 100}%` }}
                      />
                    </div>
                  </div>

                  {group.notes ? (
                    <div className="line-clamp-1 text-[11px] leading-4 text-stone-500 dark:text-stone-400">
                      {group.notes}
                    </div>
                  ) : null}

                  <Link
                    href={`/dashboard/groups?edit=${group.id}`}
                    className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${selectedGroup?.id === group.id ? 'bg-pine text-white dark:bg-pine dark:text-white' : 'border border-stone-200 bg-white text-stone-700 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-300'}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {selectedGroup?.id === group.id ? 'Sedang diedit' : 'Edit'}
                  </Link>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={FolderOpen}
              title="Belum ada grup"
              description="Buat grup pertama Anda untuk mulai menerima pendaftaran peserta kurban."
              action={{ label: 'Buat Grup', href: '/dashboard/groups?modal=add' }}
            />
          </div>
        )}
      </section>

      <AddGroupModal />
    </div>
  );
}
