import Link from 'next/link';
import { FileSpreadsheet, FileText, Download, Users, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';

import { MetricCard } from '@/components/dashboard/metric-card';
import { GroupOccupancyProgress } from '@/components/dashboard/group-occupancy-progress';
import { GroupStatusBadge } from '@/components/dashboard/group-status-badge';
import { PaymentStatusBadge } from '@/components/dashboard/payment-status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { requireOperationalUser } from '@/lib/auth';
import { getDashboardReportsData, getReportAnimalLabel } from '@/lib/services/report-service';
import { formatCurrency, formatDate, formatPercent, getOccupancyProgress } from '@/lib/utils';

export default async function ReportsPage() {
  await requireOperationalUser({ next: '/dashboard/reports' });
  const reports = await getDashboardReportsData();
  const mobileParticipantPreviewCount = 6;
  const mobileParticipantPreview = reports.participants.slice(0, mobileParticipantPreviewCount);
  const remainingMobileParticipants = Math.max(reports.participants.length - mobileParticipantPreview.length, 0);

  return (
    <div className="section-gap-lg">
      <PageHeader
        eyebrow="Laporan"
        title="Rekap operasional qurban"
        description="Pantau progres slot, komposisi pembayaran, dan daftar peserta dalam satu halaman yang siap diunduh ke Excel atau PDF."
        meta={<span className="inline-flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400"><span className="h-1.5 w-1.5 rounded-full bg-palm animate-pulse" /> Diperbarui {formatDate(reports.generatedAt)}</span>}
      />

      <section className="dashboard-grid-md grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Peserta"
          value={reports.summary.totalParticipants}
          icon={Users}
        />
        <MetricCard
          label="Slot Isi"
          value={`${reports.summary.occupiedSlots}/${reports.summary.totalCapacity}`}
          icon={TrendingUp}
        />
        <MetricCard
          label="Grup Aktif"
          value={reports.summary.openGroups}
          icon={AlertCircle}
          variant={reports.summary.urgentGroups > 0 ? 'urgent' : 'default'}
        />
        <MetricCard
          label="Slot Sisa"
          value={reports.summary.availableSlots}
          icon={CreditCard}
        />
      </section>

      <section className="dashboard-grid-md gap-3 sm:gap-4">
        <Link
          href="/api/reports/excel"
          className="group flex items-center gap-3 rounded-[20px] border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white p-3.5 sm:gap-4 sm:rounded-[24px] sm:p-5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-stone-900/80 dark:hover:border-emerald-800"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 transition group-hover:scale-105 sm:h-14 sm:w-14 dark:bg-emerald-900/50 dark:text-emerald-300">
            <FileSpreadsheet className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Export Excel</p>
            <p className="mt-1 text-[11px] leading-5 text-emerald-700/80 sm:text-xs dark:text-emerald-400/80">Multi-sheet grup, peserta, dan ringkasan operasional.</p>
          </div>
          <Download className="h-4 w-4 text-emerald-600 transition group-hover:translate-y-0.5 sm:h-5 sm:w-5 dark:text-emerald-400" />
        </Link>

        <Link
          href="/api/reports/pdf"
          className="group flex items-center gap-3 rounded-[20px] border border-amber-200/60 bg-gradient-to-br from-amber-50 to-white p-3.5 sm:gap-4 sm:rounded-[24px] sm:p-5 transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg dark:border-amber-900/40 dark:from-amber-950/30 dark:to-stone-900/80 dark:hover:border-amber-800"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 transition group-hover:scale-105 sm:h-14 sm:w-14 dark:bg-amber-900/50 dark:text-amber-300">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Export PDF</p>
            <p className="mt-1 text-[11px] leading-5 text-amber-700/80 sm:text-xs dark:text-amber-400/80">Ringkasan indikator inti untuk dibagikan cepat.</p>
          </div>
          <Download className="h-4 w-4 text-amber-600 transition group-hover:translate-y-0.5 sm:h-5 sm:w-5 dark:text-amber-400" />
        </Link>
      </section>

      <section className="dashboard-grid-xl">
        <div className="table-shell">
          <div className="table-toolbar table-toolbar-compact">
            <div className="table-toolbar-title">
              <div className="table-toolbar-icon bg-ember/10 text-ember dark:bg-amber-900/30 dark:text-amber-200">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="section-eyebrow">Ringkasan Pembayaran</p>
                <h2 className="section-title-lg mt-0.5">Komposisi status pembayaran</h2>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-[color:var(--line-soft)] p-4 sm:hidden">
            {reports.paymentBreakdown.map((item) => {
              const ratio = getOccupancyProgress(item.count, reports.summary.totalParticipants).ratio;
              const colorClass = item.status === 'paid' ? 'progress-bar-emerald' : item.status === 'partial' ? 'progress-bar-amber' : 'bg-stone-400';
              const percentClass = item.status === 'paid' ? 'text-emerald-700 dark:text-emerald-300' : item.status === 'partial' ? 'text-amber-700 dark:text-amber-300' : 'text-stone-600 dark:text-stone-400';

              return (
                <article key={item.status} className="list-row list-row-compact space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <PaymentStatusBadge status={item.status} />
                    <div className="text-right">
                      <p className="text-lg font-semibold text-pine dark:text-stone-100">{item.count}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">peserta</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs font-medium text-stone-500 dark:text-stone-400">
                      <span>Proporsi peserta</span>
                      <span className={percentClass}>{formatPercent(ratio, 0)}</span>
                    </div>
                    <div className="progress-track progress-track-sm mt-2">
                      <div className={`progress-bar ${colorClass}`} style={{ width: `${ratio * 100}%` }} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hidden sm:block table-scroll">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Jumlah</th>
                  <th className="w-40">Proporsi</th>
                </tr>
              </thead>
              <tbody>
                {reports.paymentBreakdown.map((item) => {
                  const ratio = getOccupancyProgress(item.count, reports.summary.totalParticipants).ratio;
                  const colorClass = item.status === 'paid' ? 'progress-bar-emerald' : item.status === 'partial' ? 'progress-bar-amber' : 'bg-stone-400';
                  const percentClass = item.status === 'paid' ? 'text-emerald-700 dark:text-emerald-300' : item.status === 'partial' ? 'text-amber-700 dark:text-amber-300' : 'text-stone-600 dark:text-stone-400';

                  return (
                    <tr key={item.status}>
                      <td>
                        <PaymentStatusBadge status={item.status} />
                      </td>
                      <td>
                        <span className="text-lg font-semibold text-pine dark:text-stone-100">{item.count}</span>
                        <span className="ml-1 text-xs text-stone-500 dark:text-stone-400">peserta</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="progress-track progress-track-sm">
                              <div className={`progress-bar ${colorClass}`} style={{ width: `${ratio * 100}%` }} />
                            </div>
                          </div>
                          <span className={`w-12 text-right text-xs font-semibold ${percentClass}`}>{formatPercent(ratio, 0)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[color:var(--line-soft)] p-5">
            <div className="panel-muted p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ember">Catatan Laporan</p>
              <p className="mt-2 text-xs leading-6 text-stone-600 dark:text-stone-300">
                Data disusun dari profil <span className="font-semibold text-pine dark:text-stone-200">{reports.mosque.name}</span> di {reports.mosque.city}. Export Excel memuat beberapa sheet operasional, sedangkan PDF merangkum indikator inti untuk dibagikan cepat.
              </p>
            </div>
          </div>
        </div>

        <div className="table-shell">
          <div className="table-toolbar table-toolbar-compact">
            <div className="table-toolbar-title">
              <div className="table-toolbar-icon">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="section-eyebrow">Progress Grup</p>
                <h2 className="section-title-lg mt-0.5">Okupansi dan tindak lanjut</h2>
              </div>
            </div>
            <Link href="/dashboard/groups" className="button-muted w-full px-4 py-2 text-xs sm:w-auto">
              Buka manajemen grup
            </Link>
          </div>

          <div className="space-y-3 border-t border-[color:var(--line-soft)] p-4 sm:hidden">
            {reports.groups.map((group) => (
              <article key={group.id} className="list-row list-row-compact space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-pine dark:text-stone-100">{group.name}</p>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{getReportAnimalLabel(group.animalType)} • {formatCurrency(group.pricePerSlot)}</p>
                  </div>
                  <GroupStatusBadge
                    status={group.status}
                    isFull={group.isFull}
                    isUrgent={group.isUrgent}
                    slotsLeft={group.slotsLeft}
                    openLabelPrefix="Tersisa "
                    className="shrink-0"
                  />
                </div>

                <div className="rounded-[20px] bg-sand px-4 py-3 dark:bg-stone-900/80">
                  <div className="flex items-center justify-between text-xs font-medium text-stone-500 dark:text-stone-400">
                    <span>Okupansi</span>
                    <span>{group.filledSlots}/{group.capacity} • {group.occupancyLabel}</span>
                  </div>
                  <GroupOccupancyProgress
                    percent={group.occupancyRate * 100}
                    barClassName={group.isUrgent ? 'progress-bar-ember' : group.isFull ? 'progress-bar-stone' : 'progress-bar-palm'}
                    caption=""
                    trackClassName="progress-track progress-track-sm mt-2"
                    captionClassName="hidden"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-[18px] border border-emerald-200/70 bg-emerald-50 px-3 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">Lunas</p>
                    <p className="mt-2 text-base font-semibold text-emerald-900 dark:text-emerald-100">{group.paymentPaidCount}</p>
                  </div>
                  <div className="rounded-[18px] border border-amber-200/70 bg-amber-50 px-3 py-3 dark:border-amber-900/50 dark:bg-amber-950/20">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">DP</p>
                    <p className="mt-2 text-base font-semibold text-amber-900 dark:text-amber-100">{group.paymentPartialCount}</p>
                  </div>
                  <div className="rounded-[18px] border border-stone-200 bg-stone-50 px-3 py-3 dark:border-stone-700 dark:bg-stone-900/80">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600 dark:text-stone-300">Tunggu</p>
                    <p className="mt-2 text-base font-semibold text-stone-800 dark:text-stone-100">{group.paymentPendingCount}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden sm:block table-scroll">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Grup</th>
                  <th>Slot</th>
                  <th>Pembayaran</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.groups.map((group) => (
                  <tr key={group.id}>
                    <td>
                      <p className="font-semibold text-pine dark:text-stone-100">{group.name}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{getReportAnimalLabel(group.animalType)} • {formatCurrency(group.pricePerSlot)}</p>
                    </td>
                    <td>
                        <GroupOccupancyProgress
                          className="w-32"
                          percent={group.occupancyRate * 100}
                          barClassName={group.isUrgent ? 'progress-bar-ember' : group.isFull ? 'progress-bar-stone' : 'progress-bar-palm'}
                          caption={`${group.filledSlots}/${group.capacity} • ${group.occupancyLabel}`}
                          trackClassName="progress-track progress-track-sm"
                          captionClassName="mt-1.5 text-xs text-stone-500 dark:text-stone-400"
                        />
                      </td>
                    <td>
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span className="font-medium text-emerald-700 dark:text-emerald-300">{group.paymentPaidCount} lunas</span>
                        <span className="text-stone-500 dark:text-stone-400">{group.paymentPartialCount} DP, {group.paymentPendingCount} tunggu</span>
                      </div>
                    </td>
                    <td>
                      <GroupStatusBadge
                        status={group.status}
                        isFull={group.isFull}
                        isUrgent={group.isUrgent}
                        slotsLeft={group.slotsLeft}
                        openLabelPrefix="Tersisa "
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="table-shell">
        <div className="table-toolbar">
          <div className="table-toolbar-title">
            <div className="table-toolbar-icon">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="section-eyebrow">Rekap Peserta</p>
              <h2 className="section-title-lg mt-0.5">Data peserta untuk follow up</h2>
            </div>
          </div>
          <div className="table-toolbar-meta">
            <span className="h-2 w-2 rounded-full bg-palm" />
            <span className="font-medium text-stone-700 dark:text-stone-200">{reports.participants.length} peserta</span>
          </div>
        </div>

        <div className="space-y-3 border-t border-[color:var(--line-soft)] p-4 sm:hidden">
          <div className="rounded-[18px] bg-sand px-4 py-3 text-xs text-stone-600 dark:bg-stone-900/80 dark:text-stone-300">
            <p className="font-semibold text-pine dark:text-stone-100">Preview follow up peserta</p>
            <p className="mt-1 leading-5">Menampilkan {mobileParticipantPreview.length} peserta teratas untuk ringkasan cepat di layar mobile.</p>
          </div>
          {mobileParticipantPreview.map((participant) => (
            <article key={participant.id} className="list-row list-row-compact space-y-2.5 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-pine dark:text-stone-100">{participant.fullName}</p>
                  <p className="mt-1 font-mono text-xs text-stone-500 dark:text-stone-400">{participant.phone}</p>
                </div>
                <PaymentStatusBadge status={participant.paymentStatus} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-[16px] bg-sand px-3 py-2.5 dark:bg-stone-900/80">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">Grup</p>
                  <p className="mt-1 font-semibold text-pine dark:text-stone-100">{participant.groupName}</p>
                  <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{getReportAnimalLabel(participant.animalType)}</p>
                </div>
                <div className="rounded-[16px] bg-sand px-3 py-2.5 dark:bg-stone-900/80">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">Domisili</p>
                  <p className="mt-1 font-semibold text-pine dark:text-stone-100">{participant.city}</p>
                  <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Daftar {formatDate(participant.registeredAt)}</p>
                </div>
              </div>

              {participant.notes ? (
                <div className="rounded-[16px] border border-[color:var(--line-soft)] px-3 py-2 text-xs leading-5 text-stone-600 dark:text-stone-300">
                  {participant.notes}
                </div>
              ) : null}
            </article>
          ))}
          {remainingMobileParticipants > 0 ? (
            <div className="rounded-[18px] border border-dashed border-[color:var(--line-soft)] px-4 py-3 text-center text-xs font-medium text-stone-500 dark:text-stone-400">
              +{remainingMobileParticipants} peserta lainnya tersedia di tabel desktop dan file export.
            </div>
          ) : null}
        </div>

        <div className="hidden sm:block table-scroll">
          <table className="table-base">
            <thead>
              <tr>
                <th>Peserta</th>
                <th>Grup</th>
                <th>Domisili</th>
                <th>Status Bayar</th>
                <th>Terdaftar</th>
              </tr>
            </thead>
            <tbody>
              {reports.participants.map((participant) => (
                <tr key={participant.id}>
                  <td>
                    <p className="font-semibold text-pine dark:text-stone-100">{participant.fullName}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-mono">{participant.phone}</p>
                    {participant.notes ? <p className="mt-1.5 max-w-[280px] truncate text-xs text-stone-500 dark:text-stone-400" title={participant.notes}>{participant.notes}</p> : null}
                  </td>
                  <td>
                    <p className="text-sm font-medium text-stone-700 dark:text-stone-200">{participant.groupName}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{getReportAnimalLabel(participant.animalType)}</p>
                  </td>
                  <td>
                    <span className="text-sm text-stone-700 dark:text-stone-200">{participant.city}</span>
                  </td>
                  <td>
                    <PaymentStatusBadge status={participant.paymentStatus} />
                  </td>
                  <td>
                    <span className="text-sm text-stone-600 dark:text-stone-300">{formatDate(participant.registeredAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
