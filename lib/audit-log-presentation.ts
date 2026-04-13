import type { AuditLogRecord } from '@/lib/services/audit-log-service';

type AuditLogActionFamily = 'group' | 'participant' | 'staff_user' | 'other';

interface AuditActionPresentation {
  shortLabel: string;
  label: string;
  showRawActionAsSecondaryText: boolean;
}

interface AuditMetadataEntry {
  key: string;
  label: string;
  value: string;
  isComplex: boolean;
}

interface AuditMetadataState {
  count: number;
  hasMetadata: boolean;
  highlights: AuditMetadataEntry[];
  summary: string;
}

const AUDIT_METADATA_SUMMARY_ITEM_MAX_LENGTH = 44;

const AUDIT_ACTION_LABELS: Record<string, AuditActionPresentation> = {
  'group.create': {
    shortLabel: 'Buat grup',
    label: 'Grup baru dibuat',
    showRawActionAsSecondaryText: true,
  },
  'group.update': {
    shortLabel: 'Ubah grup',
    label: 'Data grup diperbarui',
    showRawActionAsSecondaryText: true,
  },
  'group.delete': {
    shortLabel: 'Hapus grup',
    label: 'Grup dihapus',
    showRawActionAsSecondaryText: true,
  },
  'participant.create': {
    shortLabel: 'Tambah peserta',
    label: 'Peserta baru ditambahkan',
    showRawActionAsSecondaryText: true,
  },
  'participant.update': {
    shortLabel: 'Ubah peserta',
    label: 'Data peserta diperbarui',
    showRawActionAsSecondaryText: true,
  },
  'participant.delete': {
    shortLabel: 'Hapus peserta',
    label: 'Peserta dihapus',
    showRawActionAsSecondaryText: true,
  },
  'participant.move': {
    shortLabel: 'Pindah peserta',
    label: 'Peserta dipindahkan ke grup lain',
    showRawActionAsSecondaryText: true,
  },
  'participant.payment.create': {
    shortLabel: 'Tambah pembayaran',
    label: 'Catatan pembayaran peserta ditambahkan',
    showRawActionAsSecondaryText: true,
  },
  'participant.payment.update': {
    shortLabel: 'Ubah pembayaran',
    label: 'Status atau detail pembayaran peserta diperbarui',
    showRawActionAsSecondaryText: true,
  },
  'participant.payment.delete': {
    shortLabel: 'Hapus pembayaran',
    label: 'Catatan pembayaran peserta dihapus',
    showRawActionAsSecondaryText: true,
  },
  'staff_user.create': {
    shortLabel: 'Tambah panitia',
    label: 'Akun panitia baru dibuat',
    showRawActionAsSecondaryText: true,
  },
  'staff_user.update': {
    shortLabel: 'Ubah panitia',
    label: 'Data akun panitia diperbarui',
    showRawActionAsSecondaryText: true,
  },
  'staff_user.activate': {
    shortLabel: 'Aktifkan panitia',
    label: 'Akun panitia diaktifkan',
    showRawActionAsSecondaryText: true,
  },
  'staff_user.deactivate': {
    shortLabel: 'Nonaktifkan panitia',
    label: 'Akun panitia dinonaktifkan',
    showRawActionAsSecondaryText: true,
  },
  'staff_user.delete': {
    shortLabel: 'Hapus panitia',
    label: 'Akun panitia dihapus',
    showRawActionAsSecondaryText: true,
  },
};

const AUDIT_METADATA_LABELS: Record<string, string> = {
  animalType: 'Jenis hewan',
  paymentStatus: 'Status pembayaran',
  groupId: 'ID grup',
  targetGroupId: 'ID grup tujuan',
  sourceGroupId: 'ID grup asal',
  participantId: 'ID peserta',
  staffUserId: 'ID panitia',
  actorEmail: 'Email pelaku',
  actorRole: 'Peran pelaku',
  status: 'Status',
  email: 'Email',
  role: 'Peran',
  notes: 'Catatan',
  reason: 'Alasan',
  createdAt: 'Dibuat pada',
  updatedAt: 'Diperbarui pada',
  deletedAt: 'Dihapus pada',
  amount: 'Jumlah',
  total: 'Total',
  name: 'Nama',
};

function toHeadlineLabel(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function toSentenceCaseLabel(value: string) {
  if (value.length === 0) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getAuditMetadataLabel(key: string) {
  return AUDIT_METADATA_LABELS[key] ?? toSentenceCaseLabel(toHeadlineLabel(key).toLowerCase());
}

function humanizeAuditActionSegment(segment: string) {
  return segment
    .split('.')
    .map((part) => part.replace(/[_-]+/g, ' '))
    .join(' ');
}

export function getAuditActionPresentation(action: string): AuditActionPresentation {
  const mappedAction = AUDIT_ACTION_LABELS[action];

  if (mappedAction) {
    return mappedAction;
  }

  const family = getAuditActionFamily(action);
  const normalizedAction = humanizeAuditActionSegment(action);

  if (family === 'group') {
    return {
      shortLabel: 'Aktivitas grup',
      label: `Aktivitas grup: ${normalizedAction}`,
      showRawActionAsSecondaryText: true,
    };
  }

  if (family === 'participant') {
    return {
      shortLabel: 'Aktivitas peserta',
      label: `Aktivitas peserta: ${normalizedAction}`,
      showRawActionAsSecondaryText: true,
    };
  }

  if (family === 'staff_user') {
    return {
      shortLabel: 'Aktivitas panitia',
      label: `Aktivitas panitia: ${normalizedAction}`,
      showRawActionAsSecondaryText: true,
    };
  }

  return {
    shortLabel: toHeadlineLabel(normalizedAction),
    label: `Aksi ${normalizedAction}`,
    showRawActionAsSecondaryText: true,
  };
}

export function getAuditActionShortLabel(action: string) {
  return getAuditActionPresentation(action).shortLabel;
}

export function getAuditActionLabel(action: string) {
  return getAuditActionPresentation(action).label;
}

function stringifyAuditMetadataValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (value === null || value === undefined) {
    return '-';
  }

  if (Array.isArray(value)) {
    return JSON.stringify(value, null, 2);
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return JSON.stringify(value, null, 2);
}

function isAuditMetadataComplexValue(value: unknown) {
  if (value === null || value === undefined) {
    return false;
  }

  if (Array.isArray(value)) {
    return true;
  }

  return typeof value === 'object';
}

function truncateAuditMetadataSummaryValue(value: string) {
  if (value.length <= AUDIT_METADATA_SUMMARY_ITEM_MAX_LENGTH) {
    return value;
  }

  return `${value.slice(0, AUDIT_METADATA_SUMMARY_ITEM_MAX_LENGTH - 1).trimEnd()}...`;
}

function getAuditMetadataSummaryValue(value: unknown) {
  if (value === null || value === undefined) {
    return '-';
  }

  if (typeof value === 'string') {
    return truncateAuditMetadataSummaryValue(value.replace(/\s+/g, ' ').trim());
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `${value.length} item`;
  }

  if (typeof value === 'object') {
    return `${Object.keys(value as Record<string, unknown>).length} properti`;
  }

  return truncateAuditMetadataSummaryValue(String(value).replace(/\s+/g, ' ').trim());
}

function getAuditMetadataEntries(metadata: AuditLogRecord['metadata']): AuditMetadataEntry[] {
  return Object.entries(metadata)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => ({
      key,
      label: getAuditMetadataLabel(key),
      value: stringifyAuditMetadataValue(value),
      isComplex: isAuditMetadataComplexValue(value),
    }));
}

export function getAuditSeverityBadgeClassName(severity: AuditLogRecord['severity']) {
  if (severity === 'error') {
    return 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300';
  }

  if (severity === 'warn') {
    return 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300';
  }

  return 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300';
}

export function getAuditSeverityLabel(severity: AuditLogRecord['severity']) {
  if (severity === 'error') return 'Galat';
  if (severity === 'warn') return 'Peringatan';
  return 'Info';
}

export function getAuditActionFamily(action: string): AuditLogActionFamily {
  if (action.startsWith('group.')) return 'group';
  if (action.startsWith('participant.')) return 'participant';
  if (action.startsWith('staff_user.')) return 'staff_user';
  return 'other';
}

export function getAuditActionBadgeClassName(action: string) {
  const family = getAuditActionFamily(action);

  if (family === 'group') {
    return 'border border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300';
  }

  if (family === 'participant') {
    return 'border border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900/50 dark:bg-teal-950/30 dark:text-teal-300';
  }

  if (family === 'staff_user') {
    return 'border border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-300';
  }

  return 'border border-stone-200 bg-stone-50 text-stone-700 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-200';
}

export function getAuditActionFamilyLabel(action: string) {
  const family = getAuditActionFamily(action);

  if (family === 'group') return 'Grup';
  if (family === 'participant') return 'Peserta';
  if (family === 'staff_user') return 'Panitia';
  return 'Lainnya';
}

export function getAuditEntityTypeLabel(entityType: string) {
  if (entityType === 'group') return 'Grup';
  if (entityType === 'participant') return 'Peserta';
  if (entityType === 'staff_user') return 'Panitia';
  return toHeadlineLabel(entityType);
}

export function formatAuditActorLabel(log: Pick<AuditLogRecord, 'actorEmail' | 'actorRole'>) {
  const email = log.actorEmail ?? 'Sistem';
  const role = log.actorRole ? ` (${log.actorRole})` : '';
  return `${email}${role}`;
}

export function getAuditImpactSummary(log: Pick<AuditLogRecord, 'action' | 'entityType' | 'entityId' | 'severity' | 'metadata'>) {
  const entityLabel = getAuditEntityTypeLabel(log.entityType).toLowerCase();
  const targetLabel = log.entityId ? `${entityLabel} ${log.entityId}` : entityLabel;
  const metadataEntries = getAuditMetadataEntries(log.metadata);
  const metadataLabel = metadataEntries.length > 0 ? ` dengan ${metadataEntries.length} detail metadata` : '';
  const actionLabel = getAuditActionLabel(log.action);

  return `${actionLabel} tercatat pada ${targetLabel} dengan tingkat ${getAuditSeverityLabel(log.severity).toLowerCase()}${metadataLabel}.`;
}

export function getAuditMetadataSummary(metadata: AuditLogRecord['metadata']) {
  const entries = getAuditMetadataEntries(metadata);

  if (entries.length === 0) {
    return 'Tidak ada metadata tambahan untuk event ini.';
  }

  return entries
    .slice(0, 3)
    .map((entry) => {
      const rawValue = metadata[entry.key];
      return `${entry.label}: ${getAuditMetadataSummaryValue(rawValue)}`;
    })
    .join(' • ');
}

export function getAuditMetadataHighlights(metadata: AuditLogRecord['metadata']) {
  return getAuditMetadataEntries(metadata).slice(0, 4);
}

export function getAuditMetadataState(metadata: AuditLogRecord['metadata']): AuditMetadataState {
  const entries = getAuditMetadataEntries(metadata);

  return {
    count: entries.length,
    hasMetadata: entries.length > 0,
    highlights: entries.slice(0, 4),
    summary: getAuditMetadataSummary(metadata),
  };
}

export function getStructuredAuditMetadata(metadata: AuditLogRecord['metadata']) {
  const entries = getAuditMetadataEntries(metadata);

  return {
    fields: entries.filter((entry) => !entry.isComplex),
    blocks: entries.filter((entry) => entry.isComplex),
  };
}

export function formatAuditMetadata(metadata: AuditLogRecord['metadata']) {
  return JSON.stringify(metadata ?? {}, null, 2);
}
