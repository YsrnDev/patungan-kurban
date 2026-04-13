create extension if not exists pgcrypto;

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity_type text not null,
  entity_id text null,
  actor_user_id text null,
  actor_email text null,
  actor_role text null,
  severity text not null default 'info',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint audit_logs_severity_check check (severity in ('info', 'warn', 'error'))
);

create index if not exists audit_logs_created_at_idx
  on public.audit_logs (created_at desc);

create index if not exists audit_logs_action_idx
  on public.audit_logs (action);

create index if not exists audit_logs_entity_type_idx
  on public.audit_logs (entity_type);

alter table public.audit_logs enable row level security;
