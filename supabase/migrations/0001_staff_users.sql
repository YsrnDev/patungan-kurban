create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'app_role'
  ) then
    create type public.app_role as enum ('admin', 'panitia');
  end if;
end
$$;

create table if not exists public.staff_users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text null,
  role public.app_role not null default 'panitia',
  is_active boolean not null default true,
  notes text null,
  invited_by_email text null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deactivated_at timestamptz null,
  last_login_at timestamptz null,
  constraint staff_users_email_lowercase check (email = lower(email)),
  constraint staff_users_email_unique unique (email)
);

create or replace function public.set_staff_users_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_staff_users_updated_at on public.staff_users;

create trigger set_staff_users_updated_at
before update on public.staff_users
for each row
execute function public.set_staff_users_updated_at();

alter table public.staff_users enable row level security;

drop policy if exists "staff_users_select_own_record" on public.staff_users;
create policy "staff_users_select_own_record"
on public.staff_users
for select
to authenticated
using (lower(auth.email()) = email);

insert into public.staff_users (email, full_name, role, is_active, notes)
values (
  'admin@masjidnurulhuda.id',
  'Admin Utama Masjid Nurul Huda',
  'admin',
  true,
  'Bootstrap admin contoh untuk dashboard kurban. Ganti ke email admin nyata yang bisa menerima magic link.'
)
on conflict (email) do update
set
  role = excluded.role,
  is_active = true,
  full_name = excluded.full_name,
  notes = excluded.notes,
  deactivated_at = null;
