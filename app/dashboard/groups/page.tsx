import Link from 'next/link';
import { FolderOpen, Pencil, Plus } from 'lucide-react';

import { AppAlert } from '@/components/ui/app-alert';
import { GroupOccupancyProgress } from '@/components/dashboard/group-occupancy-progress';
import { GroupStatusBadge } from '@/components/dashboard/group-status-badge';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { AddGroupModal } from '@/components/dashboard/add-group-modal';
import { EditGroupModal } from '@/components/dashboard/edit-group-modal';
import { resolveGroupsFlash } from '@/lib/flash';
import { requireOperationalUser } from '@/lib/auth';
import { getDashboardData } from '@/lib/services/qurban-service';
import { formatCurrency, getOccupancyProgress } from '@/lib/utils';
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
  const selectedGroup =
    searchParams.modal === 'edit' && searchParams.edit
      ? groups.find((group) => group.id === searchParams.edit) ?? null
      : null;
  const successFlash = resolveGroupsFlash(searchParams.success);
  const errorFlash = resolveGroupsFlash(searchParams.error);

  const hasGroups = groups.length > 0;

  const buildGroupsHref = (nextParams: Record<string, string | null>) => {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    Object.entries(nextParams).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const query = params.toString();
    return query ? `/dashboard/groups?${query}` : '/dashboard/groups';
  };

  return (
    <div className="section-gap-md">
      <PageHeader
        eyebrow="Manajemen Grup"
        title="Kelola batch hewan dengan struktur yang lebih ringkas"
        description="Kelola grup hewan kurban, pantau kapasitas, dan perbarui informasi dengan mudah."
      />

      {successFlash ? (
        <AppAlert tone={successFlash.tone}>{successFlash.message}</AppAlert>
      ) : null}
      {errorFlash ? (
        <AppAlert tone={errorFlash.tone}>{errorFlash.message}</AppAlert>
      ) : null}

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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <span className="table-toolbar-meta">{groups.length} grup aktif</span>
            <Link
              href={buildGroupsHref({ modal: 'add', edit: null })}
              className="button-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Tambah Grup
            </Link>
          </div>
        </div>

        {hasGroups ? (
          <>
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
                    {groups.map((group) => {
                      const occupancy = getOccupancyProgress(group.filledSlots, group.capacity);

                      return <tr key={group.id}>
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
                          <GroupOccupancyProgress
                            className="w-28"
                            percent={occupancy.percent}
                            barClassName={group.isUrgent ? 'progress-bar-ember' : group.isFull ? 'progress-bar-stone' : 'progress-bar-palm'}
                            caption={`${group.filledSlots} / ${group.capacity} • ${occupancy.label}`}
                          />
                        </td>
                        <td>
                          <GroupStatusBadge
                            status={group.status}
                            isFull={group.isFull}
                            isUrgent={group.isUrgent}
                            slotsLeft={group.slotsLeft}
                          />
                        </td>
                        <td>
                          <Link
                            href={buildGroupsHref({ modal: 'edit', edit: group.id })}
                            className={`${selectedGroup?.id === group.id ? 'button-primary pointer-events-none' : 'button-secondary'} inline-flex items-center gap-2 px-4 py-2 text-xs`}
                            aria-current={selectedGroup?.id === group.id ? 'page' : undefined}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            {selectedGroup?.id === group.id ? 'Sedang diedit' : 'Edit'}
                          </Link>
                        </td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3 p-4 sm:p-5 lg:hidden">
              {groups.map((group) => {
                const occupancy = getOccupancyProgress(group.filledSlots, group.capacity);

                return <article key={group.id} className="list-row list-row-compact space-y-2 px-3 py-2.5 sm:space-y-3 sm:p-4">
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
                    <GroupStatusBadge
                      status={group.status}
                      isFull={group.isFull}
                      isUrgent={group.isUrgent}
                      slotsLeft={group.slotsLeft}
                      openLabelPrefix=""
                      className="shrink-0 text-[10px]"
                    />
                  </div>

                  <div className="rounded-xl bg-sand px-3 py-2 dark:bg-stone-900/80">
                    <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">
                      <span>Kapasitas</span>
                      <span>{group.filledSlots}/{group.capacity} • {occupancy.label}</span>
                    </div>
                    <GroupOccupancyProgress
                      percent={occupancy.percent}
                      barClassName={group.isUrgent ? 'progress-bar-ember' : group.isFull ? 'progress-bar-stone' : 'progress-bar-palm'}
                      caption=""
                      trackClassName="progress-track mt-1.5 h-1.5 bg-white dark:bg-stone-800"
                      captionClassName="hidden"
                    />
                  </div>

                  {group.notes ? (
                    <div className="line-clamp-1 text-[11px] leading-4 text-stone-500 dark:text-stone-400">
                      {group.notes}
                    </div>
                  ) : null}

                  <Link
                    href={buildGroupsHref({ modal: 'edit', edit: group.id })}
                    className={`${selectedGroup?.id === group.id ? 'button-primary pointer-events-none' : 'button-secondary'} w-full gap-1.5 px-3 py-2 text-xs`}
                    aria-current={selectedGroup?.id === group.id ? 'page' : undefined}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {selectedGroup?.id === group.id ? 'Sedang diedit' : 'Edit'}
                  </Link>
                </article>;
              })}
            </div>
          </>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={FolderOpen}
              title="Belum ada grup"
              description="Buat grup pertama Anda untuk mulai menerima pendaftaran peserta kurban."
              action={{ label: 'Buat Grup', href: buildGroupsHref({ modal: 'add', edit: null }) }}
            />
          </div>
        )}
      </section>

      <AddGroupModal />
      <EditGroupModal group={selectedGroup} />
    </div>
  );
}
