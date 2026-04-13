import { AUDIT_LOG_PAGE_LIMITS, type AuditLogEntityType, type AuditLogSeverity } from '@/lib/services/audit-log-service';

export interface AuditLogSearchParams {
  severity?: string;
  entityType?: string;
  q?: string;
  from?: string;
  to?: string;
  limit?: string;
  page?: string;
}

export function normalizeAuditSeverity(value?: string): 'all' | AuditLogSeverity {
  if (value === 'info' || value === 'warn' || value === 'error') {
    return value;
  }

  return 'all';
}

export function normalizeAuditEntityType(value?: string): 'all' | AuditLogEntityType {
  if (value === 'group' || value === 'participant' || value === 'staff_user') {
    return value;
  }

  return 'all';
}

export function normalizeAuditLimit(value?: string): (typeof AUDIT_LOG_PAGE_LIMITS)[number] {
  const parsedValue = Number(value);

  if (AUDIT_LOG_PAGE_LIMITS.includes(parsedValue as (typeof AUDIT_LOG_PAGE_LIMITS)[number])) {
    return parsedValue as (typeof AUDIT_LOG_PAGE_LIMITS)[number];
  }

  return AUDIT_LOG_PAGE_LIMITS[0];
}

export function normalizeAuditPage(value?: string): number {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return 1;
  }

  return Math.floor(parsedValue);
}

export function buildAuditQueryString(params: {
  severity: 'all' | AuditLogSeverity;
  entityType: 'all' | AuditLogEntityType;
  q: string;
  from: string;
  to: string;
  limit: number;
  page?: number;
}) {
  const query = new URLSearchParams();

  if (params.severity !== 'all') {
    query.set('severity', params.severity);
  }

  if (params.entityType !== 'all') {
    query.set('entityType', params.entityType);
  }

  if (params.q.trim()) {
    query.set('q', params.q.trim());
  }

  if (params.from) {
    query.set('from', params.from);
  }

  if (params.to) {
    query.set('to', params.to);
  }

  if (params.limit !== AUDIT_LOG_PAGE_LIMITS[0]) {
    query.set('limit', String(params.limit));
  }

  if (params.page && params.page > 1) {
    query.set('page', String(params.page));
  }

  return query.toString();
}
