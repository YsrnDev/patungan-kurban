import Link from 'next/link';
import { Users, Ticket, FolderOpen, AlertCircle, CheckCircle } from 'lucide-react';

import { MetricCard } from '@/components/dashboard/metric-card';
import { EmptyState } from '@/components/dashboard/empty-state';
import { GroupOccupancyProgress } from '@/components/dashboard/group-occupancy-progress';
import { GroupStatusBadge } from '@/components/dashboard/group-status-badge';
import { PaymentStatusBadge } from '@/components/dashboard/payment-status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { getDashboardData } from '@/lib/services/qurban-service';
import { formatCurrency, formatDate, getOccupancyProgress } from '@/lib/utils';
import { getAnimalLabel } from '@/lib/validation';

export default async function DashboardPage() {
  const { mosque, groups, recentParticipants, metrics } = await getDashboardData();

  const hasGroups = groups.length > 0;
  const hasParticipants = recentParticipants.length > 0;

  return (
    <div className="section-gap-lg">
      <PageHeader
        eyebrow="Overview"
        title="Pantau progres pengisian slot dan tindak lanjut harian"
        description="Fokuskan perhatian pada grup yang hampir penuh, peserta baru masuk, dan status pembayaran yang masih perlu diproses."
      />

      <section className="info-card flex items-start gap-3 px-4 py-3 sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Perlu perhatian</p>
            <p className="mt-1 text-sm text-stone-700 dark:text-stone-200">Ada {metrics.urgentGroups} grup urgent yang tinggal sedikit slot dan perlu ditindaklanjuti.</p>
          </div>
        </div>
      </section>

      <section className="dashboard-grid-md grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Peserta"
          value={metrics.totalParticipants}
          icon={Users}
        />
        <MetricCard
          label="Slot Tersedia"
          value={metrics.availableSlots}
          icon={Ticket}
        />
        <MetricCard
          label="Grup Aktif"
          value={metrics.openGroups}
          icon={FolderOpen}
        />
        <MetricCard
          label="Grup Penuh"
          value={metrics.fullGroups}
          icon={CheckCircle}
          variant="highlight"
        />
      </section>

      <section className="dashboard-grid-xl">
        <div className="table-shell">
          <div className="table-toolbar">
            <div className="table-toolbar-title">
              <div className="table-toolbar-icon bg-ember/10 text-ember dark:bg-amber-900/30 dark:text-amber-200">
                <FolderOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="section-eyebrow">Overview Grup</p>
                <h2 className="section-title mt-1">Prioritas pengisian slot</h2>
              </div>
            </div>
            <Link href="/dashboard/groups" className="button-secondary text-xs px-4 py-2">
              Kelola grup
            </Link>
          </div>

          {hasGroups ? (
            <>
              <div className="hidden lg:block">
                <div className="table-scroll">
                  <table className="table-base">
                    <thead>
                      <tr>
                        <th>Grup</th>
                        <th>Jenis & Kapasitas</th>
                        <th>Progress</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groups.map((group) => {
                        const occupancy = getOccupancyProgress(group.filledSlots, group.capacity);

                        return <tr key={group.id}>
                          <td>
                            <p className="font-semibold text-pine dark:text-stone-100">{group.name}</p>
                            <p className="text-xs text-stone-500 dark:text-stone-400">{formatCurrency(group.pricePerSlot)} / slot</p>
                            {group.notes ? <p className="mt-1 max-w-[200px] truncate text-xs text-stone-500 dark:text-stone-400">{group.notes}</p> : null}
                          </td>
                          <td>
                            <p className="text-sm font-medium text-stone-700 dark:text-stone-200">{getAnimalLabel(group.animalType)}</p>
                            <p className="text-xs text-stone-500 dark:text-stone-400">{group.filledSlots} / {group.capacity} slot</p>
                          </td>
                          <td>
                            <GroupOccupancyProgress
                              className="w-32"
                              percent={occupancy.percent}
                              barClassName={group.isUrgent ? 'progress-bar-ember' : group.isFull ? 'progress-bar-stone' : 'progress-bar-palm'}
                              caption={`${occupancy.label} terisi`}
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
                        </tr>;
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2 p-3 sm:space-y-3 sm:p-4 lg:hidden">
                {groups.map((group) => {
                  const occupancy = getOccupancyProgress(group.filledSlots, group.capacity);

                  return <div key={group.id} className="list-row list-row-compact px-3 py-2.5 sm:p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-pine dark:text-stone-100">{group.name}</p>
                        <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">{getAnimalLabel(group.animalType)} • {formatCurrency(group.pricePerSlot)}</p>
                      </div>
                      <GroupStatusBadge
                        status={group.status}
                        isFull={group.isFull}
                        isUrgent={group.isUrgent}
                        slotsLeft={group.slotsLeft}
                        openLabelPrefix=""
                        className="text-[10px]"
                      />
                    </div>
                    <GroupOccupancyProgress
                      className="mt-2"
                      percent={occupancy.percent}
                      barClassName={group.isUrgent ? 'progress-bar-ember' : group.isFull ? 'progress-bar-stone' : 'progress-bar-palm'}
                      caption={`${group.filledSlots}/${group.capacity} slot • ${occupancy.label}`}
                      trackClassName="progress-track h-1.5"
                      captionClassName="mt-1 text-[11px] text-stone-500 dark:text-stone-400"
                    />
                    {group.notes ? <p className="mt-1.5 line-clamp-1 text-[11px] text-stone-500 dark:text-stone-400">{group.notes}</p> : null}
                  </div>;
                })}
              </div>
            </>
          ) : (
            <div className="p-5">
              <EmptyState
                icon={FolderOpen}
                title="Belum ada grup"
                description="Mulai dengan membuat grup baru untuk memulai pendaftaran kurban."
                action={{ label: 'Buat Grup Pertama', href: '/dashboard/groups' }}
              />
            </div>
          )}
        </div>

        <div className="table-shell">
          <div className="table-toolbar">
            <div className="table-toolbar-title">
              <div className="table-toolbar-icon">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="section-eyebrow">Aktivitas Terbaru</p>
                <h2 className="section-title mt-1">Peserta baru masuk</h2>
              </div>
            </div>
            <Link href="/dashboard/participants" className="button-secondary text-xs px-4 py-2">
              Lihat semua
            </Link>
          </div>

          {hasParticipants ? (
            <>
              <div className="hidden lg:block">
                <div className="table-scroll">
                  <table className="table-base">
                    <thead>
                      <tr>
                        <th>Peserta</th>
                        <th>Grup</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentParticipants.map((participant) => (
                        <tr key={participant.id}>
                          <td>
                            <p className="font-semibold text-pine dark:text-stone-100">{participant.fullName}</p>
                            <p className="text-xs text-stone-500 dark:text-stone-400">{participant.phone}</p>
                          </td>
                          <td>
                            <p className="text-sm text-stone-700 dark:text-stone-200">{participant.group?.name ?? '-'}</p>
                            <p className="text-xs text-stone-500 dark:text-stone-400">{formatDate(participant.registeredAt)}</p>
                          </td>
                          <td>
                            <PaymentStatusBadge status={participant.paymentStatus} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2 p-3 sm:space-y-3 sm:p-4 lg:hidden">
                {recentParticipants.map((participant) => (
                  <div key={participant.id} className="list-row list-row-compact px-3 py-2.5 sm:p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-pine dark:text-stone-100">{participant.fullName}</p>
                        <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">{participant.group?.name ?? 'Tanpa grup'}</p>
                      </div>
                      <PaymentStatusBadge status={participant.paymentStatus} />
                    </div>
                    <p className="mt-1.5 text-[11px] text-stone-500 dark:text-stone-400">{participant.phone} • {formatDate(participant.registeredAt)}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-5">
              <EmptyState
                icon={Users}
                title="Belum ada peserta"
                description="Peserta akan muncul di sini setelah mendaftar melalui form atau ditambahkan manual."
                action={{ label: 'Tambah Peserta', href: '/dashboard/participants' }}
              />
            </div>
          )}

          <div className="border-t border-stone-100 p-5 dark:border-stone-800">
            <p className="text-sm text-stone-600 dark:text-stone-300">
              <span className="font-semibold text-pine dark:text-gold">Lokasi:</span> {mosque.name}, {mosque.city}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
