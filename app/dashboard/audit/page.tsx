import Link from 'next/link';
import { AlertTriangle, CalendarRange, ChevronLeft, ChevronRight, Download, Eye, FileSearch, Filter, Search, Shield, UserCircle2 } from 'lucide-react';

import { EmptyState } from '@/components/dashboard/empty-state';
import { AppAlert } from '@/components/ui/app-alert';
import { PageHeader } from '@/components/ui/page-header';
import {
  buildAuditQueryString,
  normalizeAuditEntityType,
  normalizeAuditLimit,
  normalizeAuditPage,
  normalizeAuditSeverity,
  type AuditLogSearchParams,
} from '@/lib/audit-log-filters';
import {
  formatAuditActorLabel,
  getAuditActionBadgeClassName,
  getAuditActionFamilyLabel,
  getAuditActionPresentation,
  getAuditEntityTypeLabel,
  getAuditMetadataState,
  getAuditSeverityBadgeClassName,
  getAuditSeverityLabel,
} from '@/lib/audit-log-presentation';
import { requireAdminUser } from '@/lib/auth';
import {
  AUDIT_LOG_PAGE_LIMITS,
  listAuditLogs,
  normalizeAuditLogDateInput,
  type AuditLogEntityType,
  type AuditLogSeverity,
} from '@/lib/services/audit-log-service';
import { formatDate } from '@/lib/utils';

interface AuditPageProps {
  searchParams: AuditLogSearchParams;
}

const severityOptions: Array<{ value: 'all' | AuditLogSeverity; label: string }> = [
  { value: 'all', label: 'Semua tingkat' },
  { value: 'info', label: 'Info' },
  { value: 'warn', label: 'Peringatan' },
  { value: 'error', label: 'Galat' },
];

const entityTypeOptions: Array<{ value: 'all' | AuditLogEntityType; label: string }> = [
  { value: 'all', label: 'Semua entitas' },
  { value: 'group', label: 'Grup' },
  { value: 'participant', label: 'Peserta' },
  { value: 'staff_user', label: 'Panitia' },
];

function getVisibleAuditPageNumbers(currentPage: number, totalPages: number, maxVisible = 5) {
  const visibleCount = Math.min(maxVisible, totalPages);
  const halfWindow = Math.floor(visibleCount / 2);
  let start = Math.max(1, currentPage - halfWindow);
  let end = start + visibleCount - 1;

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - visibleCount + 1);
  }

  const pageNumbers: number[] = [];

  for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
    pageNumbers.push(pageNumber);
  }

  return pageNumbers;
}

export default async function AuditPage({ searchParams }: AuditPageProps) {
  const { user } = await requireAdminUser({ next: '/dashboard/audit' });
  const severity = normalizeAuditSeverity(searchParams.severity);
  const entityType = normalizeAuditEntityType(searchParams.entityType);
  const query = searchParams.q?.trim() ?? '';
  const from = normalizeAuditLogDateInput(searchParams.from);
  const to = normalizeAuditLogDateInput(searchParams.to);
  const limit = normalizeAuditLimit(searchParams.limit);
  const requestedPage = normalizeAuditPage(searchParams.page);

  const { logs, tableMissing, totalCount, totalPages, page } = await listAuditLogs({
    severity,
    entityType,
    search: query,
    from,
    to,
    limit,
    page: requestedPage,
  });
  const hasLogs = logs.length > 0;
  const hasActiveFilters = severity !== 'all' || entityType !== 'all' || query.length > 0 || from.length > 0 || to.length > 0 || limit !== AUDIT_LOG_PAGE_LIMITS[0];
  const filterQueryString = buildAuditQueryString({ severity, entityType, q: query, from, to, limit });
  const exportHref = filterQueryString ? `/api/audit/export?${filterQueryString}` : '/api/audit/export';
  const previousPageQuery = buildAuditQueryString({ severity, entityType, q: query, from, to, limit, page: Math.max(1, page - 1) });
  const nextPageQuery = buildAuditQueryString({ severity, entityType, q: query, from, to, limit, page: page + 1 });
  const previousPageHref = previousPageQuery ? `/dashboard/audit?${previousPageQuery}` : '/dashboard/audit';
  const nextPageHref = nextPageQuery ? `/dashboard/audit?${nextPageQuery}` : '/dashboard/audit';
  const activeFilterChips = [
    query ? { label: 'Pencarian', value: query } : null,
    severity !== 'all' ? { label: 'Tingkat', value: getAuditSeverityLabel(severity) } : null,
    entityType !== 'all' ? { label: 'Entitas', value: getAuditEntityTypeLabel(entityType) } : null,
    from ? { label: 'Dari', value: from } : null,
    to ? { label: 'Sampai', value: to } : null,
    limit !== AUDIT_LOG_PAGE_LIMITS[0] ? { label: 'Per halaman', value: `${limit} event` } : null,
  ].filter((chip): chip is { label: string; value: string } => chip !== null);
  const currentRangeStart = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const currentRangeEnd = totalCount === 0 ? 0 : Math.min(page * limit, totalCount);
  const visiblePageNumbers = getVisibleAuditPageNumbers(page, totalPages);

  return (
    <div className="section-gap-md">
      <PageHeader
        eyebrow="Log Audit"
        title="Pantau aktivitas admin dan panitia dari satu tempat"
        description="Halaman ini menampilkan jejak audit terbaru agar aksi penting, pelaku, dan konteks metadata lebih cepat dipahami."
        actions={tableMissing ? undefined : [{ href: exportHref, label: 'Ekspor CSV', variant: 'secondary' }]}
        meta={
          <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
            <Shield className="h-4 w-4" />
            <span>Akses admin: <span className="font-semibold text-pine dark:text-gold">{user.email}</span></span>
          </div>
        }
      />

      {tableMissing ? (
        <AppAlert tone="warning">
          Tabel <code>audit_logs</code> belum tersedia di project Supabase aktif. Migration <code>supabase/migrations/0004_audit_logs.sql</code> belum diterapkan, sehingga halaman ini hanya menampilkan pemberitahuan sampai skema remote diperbarui.
        </AppAlert>
      ) : null}

      <section className="table-shell">
        <div className="table-toolbar">
          <div className="flex flex-col gap-4">
            <div className="rounded-[28px] border border-stone-200/80 bg-white/75 p-4 shadow-sm dark:border-stone-700 dark:bg-stone-950/40 sm:p-5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between xl:gap-6">
                  <div className="table-toolbar-title xl:min-w-0 xl:flex-[1.15]">
                    <div className="table-toolbar-icon bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                      <FileSearch className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="section-eyebrow">Riwayat Aktivitas</p>
                       <h2 className="section-title mt-1">Riwayat audit dengan filter server-side</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-300">
                        Gunakan filter untuk mempersempit event penting, lalu telusuri metadata dan detail tiap perubahan tanpa meninggalkan dashboard.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3 xl:flex-1">
                    <article className="rounded-[20px] border border-stone-200/80 bg-white/85 px-4 py-3 dark:border-stone-700 dark:bg-stone-900/70">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Total event</p>
                      <p className="mt-2 text-xl font-semibold text-pine dark:text-stone-100">{tableMissing ? '-' : totalCount}</p>
                      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{tableMissing ? 'Menunggu migration' : `${logs.length} event tampil pada halaman ini`}</p>
                    </article>
                    <article className="rounded-[20px] border border-stone-200/80 bg-white/85 px-4 py-3 dark:border-stone-700 dark:bg-stone-900/70">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Halaman aktif</p>
                      <p className="mt-2 text-xl font-semibold text-pine dark:text-stone-100">{tableMissing ? '-' : page}</p>
                      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{tableMissing ? 'Skema belum siap' : totalPages > 0 ? `${totalPages} halaman tersedia` : 'Belum ada data'}</p>
                    </article>
                    <article className="rounded-[20px] border border-stone-200/80 bg-white/85 px-4 py-3 dark:border-stone-700 dark:bg-stone-900/70">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Rentang data</p>
                      <p className="mt-2 text-base font-semibold text-pine dark:text-stone-100">{tableMissing ? '-' : `${currentRangeStart}-${currentRangeEnd}`}</p>
                      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{tableMissing ? 'Audit log nonaktif' : `${limit} event per halaman`}</p>
                    </article>
                  </div>
                </div>

                <form method="get" className="panel-muted grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.5fr)_repeat(5,minmax(0,0.72fr))] lg:items-end">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-200">
                      <Search className="h-4 w-4" />
                       Cari label aksi, email pelaku, atau ID entitas
                    </label>
                    <input
                      type="search"
                      name="q"
                      defaultValue={query}
                       placeholder="Contoh: pindah peserta, admin@masjid.id, grp-001"
                      className="touch-target-lg"
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-200">
                      <Filter className="h-4 w-4" />
                      Tingkat
                    </label>
                    <select name="severity" defaultValue={severity} className="touch-target-lg">
                      {severityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-stone-700 dark:text-stone-200">Entitas</label>
                    <select name="entityType" defaultValue={entityType} className="touch-target-lg">
                      {entityTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-200">
                      <CalendarRange className="h-4 w-4" />
                      Dari tanggal
                    </label>
                    <input type="date" name="from" defaultValue={from} className="touch-target-lg" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-stone-700 dark:text-stone-200">Sampai tanggal</label>
                    <input type="date" name="to" defaultValue={to} className="touch-target-lg" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-stone-700 dark:text-stone-200">Limit per halaman</label>
                    <select name="limit" defaultValue={String(limit)} className="touch-target-lg">
                      {AUDIT_LOG_PAGE_LIMITS.map((pageLimit) => (
                        <option key={pageLimit} value={pageLimit}>
                          {pageLimit} event
                        </option>
                      ))}
                    </select>
                  </div>

                  <input type="hidden" name="page" value="1" />

                  <div className="flex flex-col gap-2 sm:flex-row lg:col-span-full lg:justify-end">
                    <button type="submit" className="button-primary w-full sm:w-auto">
                      Terapkan filter
                    </button>
                    <Link href="/dashboard/audit" className="button-secondary w-full sm:w-auto">
                      Reset
                    </Link>
                  </div>
                </form>

                {!tableMissing ? (
                  <div className="flex flex-col gap-3 rounded-[24px] border border-stone-200/80 bg-white/70 p-4 dark:border-stone-700 dark:bg-stone-900/60">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Ringkasan tampilan</p>
                        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                          {hasActiveFilters
                            ? `Menampilkan ${currentRangeStart}-${currentRangeEnd} dari ${totalCount} event yang sesuai dengan filter aktif.`
                            : `Menampilkan ${currentRangeStart}-${currentRangeEnd} dari ${totalCount} event audit terbaru tanpa penyaringan tambahan.`}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400">
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
                          {activeFilterChips.length > 0 ? `${activeFilterChips.length} filter aktif` : 'Tampilan default'}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 font-semibold text-stone-700 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-200">
                          {logs.length} hasil pada halaman ini
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {activeFilterChips.length > 0 ? activeFilterChips.map((chip) => (
                        <span
                          key={`${chip.label}-${chip.value}`}
                          className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-sand px-3 py-1.5 text-xs font-medium text-stone-700 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-200"
                        >
                          <span className="font-semibold text-pine dark:text-stone-100">{chip.label}</span>
                          <span>{chip.value}</span>
                        </span>
                      )) : (
                        <div className="rounded-[18px] border border-dashed border-stone-300 bg-white px-4 py-3 text-xs leading-5 text-stone-500 dark:border-stone-700 dark:bg-stone-950/40 dark:text-stone-400">
                          Tidak ada filter aktif. Audit log sedang menampilkan event terbaru dengan urutan dan batas default.
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {hasLogs ? (
          <>
            <div className="hidden lg:block">
              <div className="table-scroll">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>Waktu</th>
                      <th>Aksi</th>
                      <th>Entitas</th>
                      <th>Pelaku</th>
                      <th>Tingkat</th>
                      <th>Metadata</th>
                      <th className="w-24">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => {
                      const metadataState = getAuditMetadataState(log.metadata);
                      const actionPresentation = getAuditActionPresentation(log.action);

                      return (
                        <tr key={log.id}>
                          <td>
                            <p className="font-medium text-pine dark:text-stone-100">{formatDate(log.createdAt)}</p>
                          </td>
                          <td>
                            <div className="flex flex-col gap-2">
                              <span className={`inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getAuditActionBadgeClassName(log.action)}`}>
                                {getAuditActionFamilyLabel(log.action)}
                              </span>
                              <p className="font-semibold text-pine dark:text-stone-100">{actionPresentation.shortLabel}</p>
                              {actionPresentation.showRawActionAsSecondaryText ? (
                                <p className="text-xs text-stone-500 dark:text-stone-400">Kode aksi: {log.action}</p>
                              ) : null}
                            </div>
                          </td>
                          <td>
                            <p className="text-sm font-medium text-stone-700 dark:text-stone-200">{getAuditEntityTypeLabel(log.entityType)}</p>
                            <p className="text-xs text-stone-500 dark:text-stone-400">{log.entityId ?? '-'}</p>
                          </td>
                          <td>
                            <p className="text-sm text-stone-700 dark:text-stone-200">{log.actorEmail ?? 'Sistem'}</p>
                            <p className="text-xs text-stone-500 dark:text-stone-400">{log.actorRole ?? '-'}</p>
                          </td>
                          <td>
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getAuditSeverityBadgeClassName(log.severity)}`}>
                              {getAuditSeverityLabel(log.severity)}
                            </span>
                          </td>
                          <td>
                            <div className="max-w-[360px] space-y-2">
                              <p className="text-xs leading-5 text-stone-600 dark:text-stone-300">{metadataState.summary}</p>
                              <div className="flex flex-wrap gap-1.5">
                                {metadataState.highlights.length > 0 ? metadataState.highlights.map((entry) => (
                                  <span
                                    key={`${log.id}-${entry.key}`}
                                    className="inline-flex rounded-full border border-stone-200/80 bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-300"
                                  >
                                    {entry.label}
                                  </span>
                                )) : (
                                  <span className="inline-flex rounded-full border border-dashed border-stone-300 bg-white px-2.5 py-1 text-[11px] text-stone-500 dark:border-stone-700 dark:bg-stone-950/40 dark:text-stone-400">
                                    Tanpa sorotan metadata
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <Link href={`/dashboard/audit/${log.id}`} className="button-muted w-full justify-center px-3 py-2 text-xs">
                              <Eye className="h-4 w-4" />
                            Lihat
                          </Link>
                        </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3 p-4 lg:hidden">
              {logs.map((log) => {
                const metadataState = getAuditMetadataState(log.metadata);
                const actionPresentation = getAuditActionPresentation(log.action);

                return (
                  <article key={log.id} className="list-row list-row-compact space-y-4 rounded-[26px] border border-stone-200/80 bg-white/90 p-4 shadow-sm dark:border-stone-700 dark:bg-stone-950/70">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getAuditActionBadgeClassName(log.action)}`}>
                            {getAuditActionFamilyLabel(log.action)}
                          </span>
                          <span className="inline-flex rounded-full border border-stone-200/80 bg-stone-50 px-3 py-1 text-[11px] font-semibold text-stone-600 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-300">
                            {getAuditEntityTypeLabel(log.entityType)}
                          </span>
                        </div>
                        <p className="mt-3 font-semibold text-pine dark:text-stone-100">{actionPresentation.shortLabel}</p>
                        {actionPresentation.showRawActionAsSecondaryText ? (
                          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Kode aksi: {log.action}</p>
                        ) : null}
                        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{formatDate(log.createdAt)}</p>
                      </div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getAuditSeverityBadgeClassName(log.severity)}`}>
                        {getAuditSeverityLabel(log.severity)}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[20px] bg-sand px-4 py-3 text-sm dark:bg-stone-900/80">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Entitas</p>
                        <p className="mt-2 text-sm font-semibold text-pine dark:text-stone-100">{getAuditEntityTypeLabel(log.entityType)}</p>
                        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{log.entityId ?? 'ID tidak tersedia'}</p>
                      </div>
                      <div className="rounded-[20px] bg-sand px-4 py-3 text-sm dark:bg-stone-900/80">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Pelaku</p>
                        <p className="mt-2 flex items-center gap-2 text-sm font-medium text-pine dark:text-stone-100"><UserCircle2 className="h-3.5 w-3.5" /> <span>{formatAuditActorLabel(log)}</span></p>
                      </div>
                    </div>

                    <div className="rounded-[20px] border border-stone-200/80 bg-stone-50/70 px-4 py-3 dark:border-stone-700 dark:bg-stone-900/60">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Metadata</p>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400">{metadataState.highlights.length > 0 ? `${metadataState.highlights.length} sorotan` : 'Tanpa sorotan'}</span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-stone-600 dark:text-stone-300">{metadataState.summary}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {metadataState.highlights.length > 0 ? metadataState.highlights.map((entry) => (
                          <span
                            key={`${log.id}-${entry.key}`}
                            className="inline-flex rounded-full border border-stone-200/80 bg-white px-2.5 py-1 text-[11px] font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-950/70 dark:text-stone-300"
                          >
                            {entry.label}
                          </span>
                        )) : (
                          <div className="rounded-[16px] border border-dashed border-stone-300 bg-white px-3 py-2 text-[11px] leading-5 text-stone-500 dark:border-stone-700 dark:bg-stone-950/40 dark:text-stone-400">
                            Tidak ada metadata penting yang perlu disorot untuk event ini.
                          </div>
                        )}
                      </div>
                    </div>

                    <Link href={`/dashboard/audit/${log.id}`} className="button-muted w-full justify-center px-4 py-2 text-xs">
                      <Eye className="h-4 w-4" />
                      Buka detail event
                    </Link>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={tableMissing ? AlertTriangle : FileSearch}
              title={tableMissing ? 'Migration audit log belum diterapkan' : hasActiveFilters ? 'Tidak ada hasil untuk filter ini' : 'Belum ada event audit'}
              description={tableMissing
                ? 'Jalankan migration 0004 pada project Supabase aktif agar event audit bisa tersimpan dan ditampilkan di halaman ini.'
                : hasActiveFilters
                  ? 'Coba ubah tingkat, entitas, rentang tanggal, kata kunci, atau limit untuk melihat event audit yang lain.'
                  : 'Event audit akan muncul di sini setelah aksi dashboard mulai tercatat ke tabel audit_logs.'}
            />
          </div>
        )}

        {!tableMissing && totalPages > 1 ? (
          <div className="flex flex-col gap-4 border-t border-stone-200/80 px-4 py-4 sm:px-5 dark:border-stone-800">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Menampilkan {currentRangeStart}-{currentRangeEnd} dari {totalCount} event audit.</p>
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Halaman {page} dari {totalPages} dengan limit {limit} event per halaman.</p>
              </div>
              <div className="flex items-center gap-2 self-start rounded-full border border-stone-200/80 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-600 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-300 lg:self-auto">
                <Download className="h-3.5 w-3.5" />
                CSV mengikuti filter aktif
              </div>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="order-2 flex flex-wrap justify-center gap-2 sm:justify-start lg:order-1">
                {visiblePageNumbers.map((pageNumber) => {
                  const pageQuery = buildAuditQueryString({ severity, entityType, q: query, from, to, limit, page: pageNumber });
                  const href = pageQuery ? `/dashboard/audit?${pageQuery}` : '/dashboard/audit';

                  return (
                    <Link
                      key={pageNumber}
                      href={href}
                      aria-current={pageNumber === page ? 'page' : undefined}
                      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-xs font-semibold transition ${pageNumber === page
                        ? 'border-pine bg-pine text-white dark:border-gold dark:bg-gold dark:text-pine'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:text-pine dark:border-stone-700 dark:bg-stone-950/70 dark:text-stone-300 dark:hover:text-stone-100'}`}
                    >
                      {pageNumber}
                    </Link>
                  );
                })}
              </div>
              <div className="order-1 grid grid-cols-2 gap-2 sm:flex sm:items-center lg:order-2 lg:justify-end">
                <Link
                  href={previousPageHref}
                  aria-disabled={page <= 1}
                  className={`button-secondary justify-center px-4 py-2 text-xs ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </Link>
                <Link
                  href={nextPageHref}
                  aria-disabled={page >= totalPages}
                  className={`button-secondary justify-center px-4 py-2 text-xs ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
                >
                  Berikutnya
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
