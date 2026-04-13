import { NextResponse } from 'next/server';

import {
  normalizeAuditEntityType,
  normalizeAuditSeverity,
} from '@/lib/audit-log-filters';
import { requireAdminUserApi } from '@/lib/auth';
import { exportAuditLogs, normalizeAuditLogDateInput } from '@/lib/services/audit-log-service';

const MAX_EXPORT_LIMIT = 1000;
const DEFAULT_EXPORT_LIMIT = 250;

function normalizeExportLimit(value: string | null): number {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return DEFAULT_EXPORT_LIMIT;
  }

  return Math.min(Math.floor(parsedValue), MAX_EXPORT_LIMIT);
}

function escapeCsvValue(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export async function GET(request: Request) {
  const authContext = await requireAdminUserApi();

  if (authContext instanceof NextResponse) {
    return authContext;
  }

  const { searchParams } = new URL(request.url);
  const severity = normalizeAuditSeverity(searchParams.get('severity') ?? undefined);
  const entityType = normalizeAuditEntityType(searchParams.get('entityType') ?? undefined);
  const search = searchParams.get('q')?.trim() ?? '';
  const from = normalizeAuditLogDateInput(searchParams.get('from') ?? undefined);
  const to = normalizeAuditLogDateInput(searchParams.get('to') ?? undefined);
  const limit = normalizeExportLimit(searchParams.get('limit'));

  const { logs, tableMissing } = await exportAuditLogs({
    severity,
    entityType,
    search,
    from,
    to,
    limit,
  });

  if (tableMissing) {
    return NextResponse.json({ error: 'Tabel audit_logs belum tersedia.' }, { status: 503 });
  }

  const headers = ['createdAt', 'action', 'entityType', 'entityId', 'actorEmail', 'actorRole', 'severity', 'metadata'];
  const rows = logs.map((log) => ([
    log.createdAt,
    log.action,
    log.entityType,
    log.entityId ?? '',
    log.actorEmail ?? '',
    log.actorRole ?? '',
    log.severity,
    JSON.stringify(log.metadata ?? {}),
  ].map((value) => escapeCsvValue(String(value))).join(',')));

  const csv = [headers.join(','), ...rows].join('\n');
  const filename = `audit-logs-export-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
