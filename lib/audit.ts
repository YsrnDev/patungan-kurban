import 'server-only';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';

type AuditSeverity = 'info' | 'warn' | 'error';

export interface AuditLogActor {
  userId?: string | null;
  email?: string | null;
  role?: string | null;
}

export interface AuditLogEntry {
  action: string;
  entityType: 'group' | 'participant' | 'staff_user';
  entityId?: string | null;
  actor?: AuditLogActor | null;
  metadata?: Record<string, unknown>;
  severity?: AuditSeverity;
}

interface PersistedAuditLogRow {
  action: string;
  entity_type: AuditLogEntry['entityType'];
  entity_id: string | null;
  actor_user_id: string | null;
  actor_email: string | null;
  actor_role: string | null;
  severity: AuditSeverity;
  metadata: Record<string, unknown>;
}

async function persistAuditEvent(row: PersistedAuditLogRow): Promise<void> {
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from('audit_logs').insert(row);

    if (error) {
      console.error('[audit:persist-failed]', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        action: row.action,
        entityType: row.entity_type,
        entityId: row.entity_id,
      });
    }
  } catch (error) {
    console.error('[audit:persist-failed]', {
      message: error instanceof Error ? error.message : 'Unknown audit persistence error',
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
    });
  }
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  const severity = entry.severity ?? 'info';
  const metadata = entry.metadata ?? {};

  const payload = {
    timestamp: new Date().toISOString(),
    severity,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId ?? null,
    actor: {
      userId: entry.actor?.userId ?? null,
      email: entry.actor?.email ?? null,
      role: entry.actor?.role ?? null,
    },
    metadata,
  };

  console.info('[audit]', payload);

  await persistAuditEvent({
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    actor_user_id: entry.actor?.userId ?? null,
    actor_email: entry.actor?.email ?? null,
    actor_role: entry.actor?.role ?? null,
    severity,
    metadata,
  });
}
