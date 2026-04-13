import 'server-only';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export type AuditLogSeverity = 'info' | 'warn' | 'error';
export type AuditLogEntityType = 'group' | 'participant' | 'staff_user';

export interface AuditLogListOptions {
  severity?: 'all' | AuditLogSeverity;
  entityType?: 'all' | AuditLogEntityType;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogRecord {
  id: string;
  createdAt: string;
  action: string;
  entityType: string;
  entityId: string | null;
  actorEmail: string | null;
  actorRole: string | null;
  severity: AuditLogSeverity;
  metadata: Record<string, unknown>;
}

export interface AuditLogListResult {
  logs: AuditLogRecord[];
  tableMissing: boolean;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLogExportResult {
  logs: AuditLogRecord[];
  tableMissing: boolean;
 }

interface AuditLogRow {
  id: string;
  created_at: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  actor_email: string | null;
  actor_role: string | null;
  severity: AuditLogSeverity;
  metadata: Record<string, unknown> | null;
}

const AUDIT_LOGS_LIMIT = 100;
const AUDIT_LOGS_EXPORT_LIMIT = 1000;
export const AUDIT_LOG_PAGE_LIMITS = [25, 50, 100] as const;
const MISSING_AUDIT_LOG_CODES = new Set(['42P01', 'PGRST205']);

function normalizeLimit(limit?: number): number {
  if (!limit) {
    return AUDIT_LOG_PAGE_LIMITS[0];
  }

  return AUDIT_LOG_PAGE_LIMITS.includes(limit as (typeof AUDIT_LOG_PAGE_LIMITS)[number])
    ? limit
    : AUDIT_LOG_PAGE_LIMITS[0];
}

function normalizePage(page?: number): number {
  if (!page || Number.isNaN(page) || page < 1) {
    return 1;
  }

  return Math.floor(page);
}

function escapeLikePattern(value: string): string {
  return value.replace(/[,%_]/g, (char) => `\\${char}`);
}

function isValidDateParts(year: number, month: number, day: number) {
  const normalizedDate = new Date(Date.UTC(year, month - 1, day));
  return normalizedDate.getUTCFullYear() === year
    && normalizedDate.getUTCMonth() === month - 1
    && normalizedDate.getUTCDate() === day;
}

function normalizeDateValue(value?: string): string | undefined {
  if (!value) return undefined;

  const trimmedValue = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    return undefined;
  }

  const [yearValue, monthValue, dayValue] = trimmedValue.split('-');
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return undefined;
  }

  return isValidDateParts(year, month, day) ? trimmedValue : undefined;
}

function toBoundaryIsoString(value: string, boundary: 'start' | 'end'): string {
  const [yearValue, monthValue, dayValue] = value.split('-');
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);

  if (boundary === 'start') {
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)).toISOString();
  }

  return new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999)).toISOString();
}

function normalizeDateRange(options: Pick<AuditLogListOptions, 'from' | 'to'>) {
  const from = normalizeDateValue(options.from);
  const to = normalizeDateValue(options.to);

  if (from && to && from > to) {
    return { from: to, to: from };
  }

  return { from, to };
}

function isAuditLogsTableMissing(error: { code?: string | null; message?: string | null } | null): boolean {
  if (!error) return false;

  if (error.code && MISSING_AUDIT_LOG_CODES.has(error.code)) {
    return true;
  }

  return typeof error.message === 'string' && error.message.toLowerCase().includes('audit_logs');
}

function mapAuditLogRow(row: AuditLogRow): AuditLogRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    actorEmail: row.actor_email,
    actorRole: row.actor_role,
    severity: row.severity,
    metadata: row.metadata ?? {},
  };
}

function applyAuditLogFilters(query: any, options: AuditLogListOptions) {
  let nextQuery = query;

  if (options.severity && options.severity !== 'all') {
    nextQuery = nextQuery.eq('severity', options.severity);
  }

  if (options.entityType && options.entityType !== 'all') {
    nextQuery = nextQuery.eq('entity_type', options.entityType);
  }

  const normalizedSearch = options.search?.trim();

  if (normalizedSearch) {
    const pattern = `%${escapeLikePattern(normalizedSearch)}%`;
    nextQuery = nextQuery.or(`action.ilike.${pattern},actor_email.ilike.${pattern},entity_id.ilike.${pattern}`);
  }

  const { from, to } = normalizeDateRange(options);

  if (from) {
    nextQuery = nextQuery.gte('created_at', toBoundaryIsoString(from, 'start'));
  }

  if (to) {
    nextQuery = nextQuery.lte('created_at', toBoundaryIsoString(to, 'end'));
  }

  return nextQuery;
}

export function normalizeAuditLogDateInput(value?: string): string {
  return normalizeDateValue(value) ?? '';
}

export async function listAuditLogs(options: AuditLogListOptions = {}): Promise<AuditLogListResult> {
  const supabase = createSupabaseAdminClient();
  const limit = normalizeLimit(options.limit ?? AUDIT_LOGS_LIMIT);
  const requestedPage = normalizePage(options.page);

  const buildQuery = () => {
    const query = supabase
      .from('audit_logs')
      .select('id, created_at, action, entity_type, entity_id, actor_email, actor_role, severity, metadata', { count: 'exact' })
      .order('created_at', { ascending: false });

    return applyAuditLogFilters(query, options);
  };

  const initialFrom = (requestedPage - 1) * limit;
  const initialTo = initialFrom + limit - 1;
  const { data, error, count } = await buildQuery().range(initialFrom, initialTo);

  if (isAuditLogsTableMissing(error)) {
    return {
      logs: [],
      tableMissing: true,
      totalCount: 0,
      page: 1,
      limit,
      totalPages: 0,
    };
  }

  if (error) {
    throw new Error(`Failed to load audit logs: ${error.message}`);
  }

  const totalCount = count ?? 0;
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / limit) : 0;
  const page = totalPages > 0 ? Math.min(requestedPage, totalPages) : 1;
  let rows = (data ?? []) as AuditLogRow[];

  if (page !== requestedPage) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data: pagedData, error: pagedError } = await buildQuery().range(from, to);

    if (pagedError) {
      throw new Error(`Failed to load audit logs: ${pagedError.message}`);
    }

    rows = (pagedData ?? []) as AuditLogRow[];
  }

  return {
    logs: rows.map(mapAuditLogRow),
    tableMissing: false,
    totalCount,
    page,
    limit,
    totalPages,
  };
}

export async function exportAuditLogs(options: AuditLogListOptions = {}): Promise<AuditLogExportResult> {
  const supabase = createSupabaseAdminClient();
  const limit = Math.min(Math.max(options.limit ?? AUDIT_LOGS_EXPORT_LIMIT, 1), AUDIT_LOGS_EXPORT_LIMIT);

  const query = applyAuditLogFilters(
    supabase
      .from('audit_logs')
      .select('id, created_at, action, entity_type, entity_id, actor_email, actor_role, severity, metadata')
      .order('created_at', { ascending: false }),
    options
  );

  const { data, error } = await query.range(0, limit - 1);

  if (isAuditLogsTableMissing(error)) {
    return {
      logs: [],
      tableMissing: true,
    };
  }

  if (error) {
    throw new Error(`Failed to export audit logs: ${error.message}`);
  }

  return {
    logs: ((data ?? []) as AuditLogRow[]).map(mapAuditLogRow),
    tableMissing: false,
  };
}

export async function getAuditLogById(id: string): Promise<{ log: AuditLogRecord | null; tableMissing: boolean }> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('audit_logs')
    .select('id, created_at, action, entity_type, entity_id, actor_email, actor_role, severity, metadata')
    .eq('id', id)
    .maybeSingle();

  if (isAuditLogsTableMissing(error)) {
    return {
      log: null,
      tableMissing: true,
    };
  }

  if (error) {
    throw new Error(`Failed to load audit log detail: ${error.message}`);
  }

  return {
    log: data ? mapAuditLogRow(data as AuditLogRow) : null,
    tableMissing: false,
  };
}
