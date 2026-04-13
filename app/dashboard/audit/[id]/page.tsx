import Link from 'next/link';
import { AlertTriangle, ArrowLeft, CalendarDays, FileJson2, Shield, UserCircle2 } from 'lucide-react';
import { notFound } from 'next/navigation';

import { AppAlert } from '@/components/ui/app-alert';
import { PageHeader } from '@/components/ui/page-header';
import {
  formatAuditMetadata,
  getAuditActionLabel,
  getAuditActionPresentation,
  getAuditImpactSummary,
  getAuditActionBadgeClassName,
  getAuditActionFamilyLabel,
  getAuditEntityTypeLabel,
  getAuditMetadataState,
  getAuditSeverityBadgeClassName,
  getAuditSeverityLabel,
  getStructuredAuditMetadata,
} from '@/lib/audit-log-presentation';
import { requireAdminUser } from '@/lib/auth';
import { getAuditLogById } from '@/lib/services/audit-log-service';
import { formatDate } from '@/lib/utils';

interface AuditDetailPageProps {
  params: {
    id: string;
  };
}

export default async function AuditDetailPage({ params }: AuditDetailPageProps) {
  const { user } = await requireAdminUser({ next: `/dashboard/audit/${params.id}` });
  const { log, tableMissing } = await getAuditLogById(params.id);
  const structuredMetadata = log ? getStructuredAuditMetadata(log.metadata) : null;
  const metadataState = log ? getAuditMetadataState(log.metadata) : null;
  const actionPresentation = log ? getAuditActionPresentation(log.action) : null;

  if (!tableMissing && !log) {
    notFound();
  }

  return (
    <div className="section-gap-md">
      <PageHeader
        eyebrow="Detail Audit"
        title={log ? getAuditActionLabel(log.action) : 'Detail event audit belum tersedia'}
        description="Tinjau detail pelaku, entitas, tingkat kejadian, dan metadata penuh untuk satu event audit secara lebih mudah dipindai."
        actions={[{ href: '/dashboard/audit', label: 'Kembali ke audit', variant: 'secondary' }]}
        meta={
          <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
            <Shield className="h-4 w-4" />
            <span>Akses admin: <span className="font-semibold text-pine dark:text-gold">{user.email}</span></span>
          </div>
        }
      />

      {tableMissing ? (
        <AppAlert tone="warning">
          Tabel <code>audit_logs</code> belum tersedia di project Supabase aktif. Detail event audit baru dapat dibuka setelah migration diterapkan.
        </AppAlert>
      ) : null}

      {log ? (
        <section className="table-shell overflow-hidden">
          <div className="table-toolbar">
            <div className="flex flex-col gap-4">
              <div className="rounded-[28px] border border-stone-200/80 bg-white/75 p-4 shadow-sm dark:border-stone-700 dark:bg-stone-950/40 sm:p-5">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between xl:gap-6">
                    <div className="table-toolbar-title xl:min-w-0 xl:flex-1">
                      <div className="table-toolbar-icon bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                        <FileJson2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="section-eyebrow">Event Audit</p>
                        <h2 className="section-title mt-1">Metadata dan konteks event lengkap</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-300">
                          Fokuskan pemeriksaan pada ringkasan terstruktur terlebih dahulu, lalu buka payload mentah bila perlu verifikasi teknis lebih lanjut.
                        </p>
                        {log && actionPresentation?.showRawActionAsSecondaryText ? (
                          <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">Kode aksi: {log.action}</p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getAuditActionBadgeClassName(log.action)}`}>
                        {getAuditActionFamilyLabel(log.action)}
                      </span>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getAuditSeverityBadgeClassName(log.severity)}`}>
                        {getAuditSeverityLabel(log.severity)}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <article className="list-row list-row-compact space-y-2 rounded-[22px] border border-stone-200/80 bg-white/85 px-4 py-3 dark:border-stone-700 dark:bg-stone-900/70">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Aksi</p>
                      <p className="text-sm font-medium text-pine dark:text-stone-100">{actionPresentation?.shortLabel ?? '-'}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{getAuditActionFamilyLabel(log.action)}</p>
                    </article>
                    <article className="list-row list-row-compact space-y-2 rounded-[22px] border border-stone-200/80 bg-white/85 px-4 py-3 dark:border-stone-700 dark:bg-stone-900/70">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Waktu</p>
                      <p className="flex items-center gap-2 text-sm font-medium text-pine dark:text-stone-100"><CalendarDays className="h-4 w-4" /> {formatDate(log.createdAt)}</p>
                    </article>
                    <article className="list-row list-row-compact space-y-2 rounded-[22px] border border-stone-200/80 bg-white/85 px-4 py-3 dark:border-stone-700 dark:bg-stone-900/70">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Pelaku</p>
                      <p className="flex items-center gap-2 text-sm font-medium text-pine dark:text-stone-100"><UserCircle2 className="h-4 w-4" /> {log.actorEmail ?? 'Sistem'}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Peran pelaku: {log.actorRole ?? 'Tidak tercatat'}</p>
                    </article>
                    <article className="list-row list-row-compact space-y-2 rounded-[22px] border border-stone-200/80 bg-white/85 px-4 py-3 dark:border-stone-700 dark:bg-stone-900/70">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Entitas</p>
                      <p className="text-sm font-medium text-pine dark:text-stone-100">{getAuditEntityTypeLabel(log.entityType)}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">ID entitas: {log.entityId ?? 'Tidak tersedia'}</p>
                    </article>
                    <article className="list-row list-row-compact space-y-2 rounded-[22px] border border-stone-200/80 bg-white/85 px-4 py-3 dark:border-stone-700 dark:bg-stone-900/70">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Event ID</p>
                      <p className="break-all text-sm font-medium text-pine dark:text-stone-100">{log.id}</p>
                    </article>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-t border-[color:var(--line-soft)] p-4 sm:p-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="space-y-4">
              <section className="panel-muted p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ember">Metadata terstruktur</p>
                    <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Field penting ditampilkan lebih dulu agar konteks event cepat dipindai sebelum membuka payload mentah.</p>
                  </div>
                  <span className="rounded-full border border-stone-200/80 bg-white px-3 py-1 text-[11px] font-semibold text-stone-600 dark:border-stone-700 dark:bg-stone-950/70 dark:text-stone-300">
                    {structuredMetadata && structuredMetadata.fields.length + structuredMetadata.blocks.length > 0
                      ? `${structuredMetadata.fields.length + structuredMetadata.blocks.length} item`
                      : 'Metadata kosong'}
                  </span>
                </div>

                {structuredMetadata && structuredMetadata.fields.length > 0 ? (
                  <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    {structuredMetadata.fields.map((entry) => (
                      <div key={entry.key} className="rounded-[20px] border border-stone-200/80 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-950/60">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">{entry.label}</dt>
                        <dd className="mt-2 break-words text-sm leading-6 text-pine dark:text-stone-100">{entry.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <div className="mt-4 rounded-[20px] border border-dashed border-stone-300 bg-white px-4 py-3 text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-950/40 dark:text-stone-400">
                    Tidak ada metadata sederhana yang perlu ditampilkan untuk event ini.
                  </div>
                )}

                {structuredMetadata && structuredMetadata.blocks.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {structuredMetadata.blocks.map((entry) => (
                      <section key={entry.key} className="rounded-[22px] border border-stone-200/80 bg-white px-4 py-4 dark:border-stone-700 dark:bg-stone-950/60">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">{entry.label}</p>
                        <pre className="mt-3 overflow-x-auto rounded-[18px] bg-stone-950 px-4 py-4 text-xs leading-6 text-stone-100">{entry.value}</pre>
                      </section>
                    ))}
                  </div>
                ) : null}
              </section>
            </div>

            <div className="space-y-4">
              <section className="panel-muted p-4 sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ember">Ringkasan event</p>
                <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">{getAuditImpactSummary(log)}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[20px] border border-stone-200/80 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-950/60">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Kode aksi</p>
                    <p className="mt-2 break-all text-sm font-semibold text-pine dark:text-stone-100">{log.action}</p>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{getAuditActionFamilyLabel(log.action)}</p>
                  </div>
                  <div className="rounded-[20px] border border-stone-200/80 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-950/60">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Tingkat kejadian</p>
                    <p className="mt-2 text-sm font-semibold text-pine dark:text-stone-100">{getAuditSeverityLabel(log.severity)}</p>
                  </div>
                  <div className="rounded-[20px] border border-stone-200/80 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-950/60">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Peran pelaku</p>
                    <p className="mt-2 text-sm font-semibold text-pine dark:text-stone-100">{log.actorRole ?? 'Sistem / tanpa peran'}</p>
                  </div>
                  <div className="rounded-[20px] border border-stone-200/80 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-950/60">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Target entitas</p>
                    <p className="mt-2 text-sm font-semibold text-pine dark:text-stone-100">{getAuditEntityTypeLabel(log.entityType)}</p>
                    <p className="mt-1 break-all text-xs text-stone-500 dark:text-stone-400">{log.entityId ?? 'ID entitas tidak tersedia'}</p>
                  </div>
                  <div className="rounded-[20px] border border-stone-200/80 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-950/60 sm:col-span-2 xl:col-span-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Status metadata</p>
                    <p className="mt-2 text-sm font-semibold text-pine dark:text-stone-100">{metadataState?.hasMetadata ? `${metadataState.count} item metadata tercatat` : 'Tanpa metadata tambahan'}</p>
                    <p className="mt-1 text-xs leading-5 text-stone-500 dark:text-stone-400">{metadataState?.summary ?? 'Tidak ada metadata tambahan untuk diringkas.'}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-[24px] border border-stone-200/70 bg-stone-50/70 p-4 sm:p-5 dark:border-stone-800 dark:bg-stone-950/50">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ember">Payload mentah</p>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">JSON lengkap disimpan sebagai referensi teknis sekunder ketika tampilan terstruktur belum cukup menjelaskan event.</p>
                <pre className="mt-4 overflow-x-auto rounded-[20px] border border-stone-800 bg-stone-950/90 px-4 py-4 text-xs leading-6 text-stone-100">{formatAuditMetadata(log.metadata)}</pre>
              </section>
            </div>
          </div>

          <div className="border-t border-[color:var(--line-soft)] px-4 py-4 sm:px-5">
            <Link href="/dashboard/audit" className="button-secondary w-full justify-center sm:w-auto">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke viewer audit
            </Link>
          </div>
        </section>
      ) : (
        <section className="panel p-5 sm:p-6">
          <div className="flex items-start gap-3 rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Event audit tidak ditemukan.</p>
              <p className="mt-1 text-sm leading-6">ID yang diminta sudah tidak tersedia atau belum pernah tercatat pada tabel audit log.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
