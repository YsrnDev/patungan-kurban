create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'qurban_animal_type'
  ) then
    create type public.qurban_animal_type as enum ('cow', 'goat', 'sheep');
  end if;

  if not exists (
    select 1 from pg_type where typname = 'qurban_group_status'
  ) then
    create type public.qurban_group_status as enum ('open', 'closed');
  end if;

  if not exists (
    select 1 from pg_type where typname = 'qurban_payment_status'
  ) then
    create type public.qurban_payment_status as enum ('pending', 'partial', 'paid');
  end if;
end
$$;

create table if not exists public.mosque_profiles (
  id text primary key,
  name text not null,
  city text not null,
  campaign_year integer not null,
  registration_deadline date not null,
  contact_phone text not null,
  bank_info text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.qurban_groups (
  id text primary key,
  name text not null,
  animal_type public.qurban_animal_type not null,
  price_per_slot integer not null,
  status public.qurban_group_status not null default 'open',
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint qurban_groups_price_positive check (price_per_slot > 0)
);

create table if not exists public.qurban_participants (
  id text primary key,
  group_id text not null references public.qurban_groups(id) on delete restrict,
  full_name text not null,
  phone text not null,
  normalized_phone text not null,
  city text not null,
  notes text not null default '',
  payment_status public.qurban_payment_status not null default 'pending',
  registered_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists qurban_participants_group_phone_unique
  on public.qurban_participants (group_id, normalized_phone);

create index if not exists qurban_participants_group_registered_idx
  on public.qurban_participants (group_id, registered_at);

create or replace function public.qurban_get_capacity(animal public.qurban_animal_type)
returns integer
language sql
immutable
as $$
  select case
    when animal = 'cow' then 7
    else 1
  end;
$$;

create or replace function public.qurban_normalize_phone(raw_phone text)
returns text
language sql
immutable
as $$
  select regexp_replace(coalesce(raw_phone, ''), '[^0-9+]', '', 'g');
$$;

create or replace function public.set_generic_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_mosque_profiles_updated_at on public.mosque_profiles;
create trigger set_mosque_profiles_updated_at
before update on public.mosque_profiles
for each row
execute function public.set_generic_updated_at();

drop trigger if exists set_qurban_groups_updated_at on public.qurban_groups;
create trigger set_qurban_groups_updated_at
before update on public.qurban_groups
for each row
execute function public.set_generic_updated_at();

drop trigger if exists set_qurban_participants_updated_at on public.qurban_participants;
create trigger set_qurban_participants_updated_at
before update on public.qurban_participants
for each row
execute function public.set_generic_updated_at();

create or replace function public.qurban_participants_normalize_before_write()
returns trigger
language plpgsql
as $$
begin
  new.normalized_phone := public.qurban_normalize_phone(new.phone);
  return new;
end;
$$;

drop trigger if exists qurban_participants_normalize_before_write on public.qurban_participants;
create trigger qurban_participants_normalize_before_write
before insert or update on public.qurban_participants
for each row
execute function public.qurban_participants_normalize_before_write();

create or replace function public.qurban_next_group_id(group_name text)
returns text
language plpgsql
as $$
declare
  base_slug text;
  next_number integer;
begin
  base_slug := regexp_replace(lower(coalesce(group_name, 'grup')), '[^a-z0-9]+', '-', 'g');
  base_slug := regexp_replace(base_slug, '(^-+|-+$)', '', 'g');

  if base_slug = '' then
    base_slug := 'grup';
  end if;

  lock table public.qurban_groups in exclusive mode;

  select count(*) + 1 into next_number from public.qurban_groups;

  return format('grp-%s-%s', base_slug, next_number);
end;
$$;

create or replace function public.qurban_next_participant_id()
returns text
language plpgsql
as $$
declare
  next_number integer;
begin
  lock table public.qurban_participants in exclusive mode;

  select coalesce(max(substring(id from 4)::integer), 0) + 1
  into next_number
  from public.qurban_participants
  where id ~ '^pt-[0-9]+$';

  return format('pt-%s', lpad(next_number::text, 3, '0'));
end;
$$;

create or replace function public.qurban_create_group(
  p_name text,
  p_animal_type public.qurban_animal_type,
  p_price_per_slot integer,
  p_status public.qurban_group_status,
  p_notes text default ''
)
returns setof public.qurban_groups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_id text;
begin
  v_group_id := public.qurban_next_group_id(p_name);

  insert into public.qurban_groups (
    id,
    name,
    animal_type,
    price_per_slot,
    status,
    notes
  ) values (
    v_group_id,
    trim(p_name),
    p_animal_type,
    p_price_per_slot,
    p_status,
    coalesce(trim(p_notes), '')
  );

  return query
  select *
  from public.qurban_groups
  where id = v_group_id;
end;
$$;

create or replace function public.qurban_update_group(
  p_group_id text,
  p_name text,
  p_animal_type public.qurban_animal_type,
  p_price_per_slot integer,
  p_status public.qurban_group_status,
  p_notes text default ''
)
returns setof public.qurban_groups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group public.qurban_groups%rowtype;
  v_participant_count integer;
  v_next_capacity integer;
begin
  select *
  into v_group
  from public.qurban_groups
  where id = p_group_id
  for update;

  if not found then
    raise exception 'Grup tidak ditemukan.';
  end if;

  select count(*) into v_participant_count
  from public.qurban_participants
  where group_id = p_group_id;

  v_next_capacity := public.qurban_get_capacity(p_animal_type);

  if v_participant_count > v_next_capacity then
    raise exception 'Jenis hewan baru tidak cukup menampung peserta yang sudah ada.';
  end if;

  update public.qurban_groups
  set
    name = trim(p_name),
    animal_type = p_animal_type,
    price_per_slot = p_price_per_slot,
    status = p_status,
    notes = coalesce(trim(p_notes), '')
  where id = p_group_id;

  return query
  select *
  from public.qurban_groups
  where id = p_group_id;
end;
$$;

create or replace function public.qurban_delete_group(p_group_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_participant_count integer;
begin
  select count(*) into v_participant_count
  from public.qurban_participants
  where group_id = p_group_id;

  if v_participant_count > 0 then
    raise exception 'Grup yang masih memiliki peserta tidak bisa dihapus.';
  end if;

  delete from public.qurban_groups where id = p_group_id;

  if not found then
    raise exception 'Grup tidak ditemukan.';
  end if;
end;
$$;

create or replace function public.qurban_register_participant(
  p_group_id text,
  p_full_name text,
  p_phone text,
  p_city text,
  p_notes text default '',
  p_payment_status public.qurban_payment_status default 'pending'
)
returns setof public.qurban_participants
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group public.qurban_groups%rowtype;
  v_capacity integer;
  v_filled integer;
  v_participant_id text;
  v_normalized_phone text;
begin
  select *
  into v_group
  from public.qurban_groups
  where id = p_group_id
  for update;

  if not found then
    raise exception 'Grup yang dipilih tidak ditemukan.';
  end if;

  if v_group.status <> 'open' then
    raise exception 'Grup yang dipilih sedang ditutup panitia.';
  end if;

  v_normalized_phone := public.qurban_normalize_phone(p_phone);

  if exists (
    select 1
    from public.qurban_participants
    where group_id = p_group_id
      and normalized_phone = v_normalized_phone
  ) then
    raise exception 'Nomor WhatsApp ini sudah terdaftar pada grup yang sama.';
  end if;

  v_capacity := public.qurban_get_capacity(v_group.animal_type);

  select count(*) into v_filled
  from public.qurban_participants
  where group_id = p_group_id;

  if v_filled >= v_capacity then
    raise exception '% % sudah penuh. Maksimal % peserta sesuai aturan syariah.',
      case v_group.animal_type
        when 'cow' then 'Sapi'
        when 'goat' then 'Kambing'
        else 'Domba'
      end,
      v_group.name,
      v_capacity;
  end if;

  v_participant_id := public.qurban_next_participant_id();

  insert into public.qurban_participants (
    id,
    group_id,
    full_name,
    phone,
    city,
    notes,
    payment_status
  ) values (
    v_participant_id,
    p_group_id,
    trim(p_full_name),
    trim(p_phone),
    trim(p_city),
    coalesce(trim(p_notes), ''),
    p_payment_status
  );

  update public.qurban_groups
  set updated_at = timezone('utc', now())
  where id = p_group_id;

  return query
  select *
  from public.qurban_participants
  where id = v_participant_id;
end;
$$;

create or replace function public.qurban_move_participant(
  p_participant_id text,
  p_target_group_id text
)
returns setof public.qurban_participants
language plpgsql
security definer
set search_path = public
as $$
declare
  v_participant public.qurban_participants%rowtype;
  v_source_group public.qurban_groups%rowtype;
  v_target_group public.qurban_groups%rowtype;
  v_capacity integer;
  v_filled integer;
begin
  select *
  into v_participant
  from public.qurban_participants
  where id = p_participant_id
  for update;

  if not found then
    raise exception 'Peserta tidak ditemukan.';
  end if;

  select *
  into v_source_group
  from public.qurban_groups
  where id = v_participant.group_id
  for update;

  select *
  into v_target_group
  from public.qurban_groups
  where id = p_target_group_id
  for update;

  if not found then
    raise exception 'Grup tujuan tidak ditemukan.';
  end if;

  if v_participant.group_id = p_target_group_id then
    return query
    select *
    from public.qurban_participants
    where id = p_participant_id;
    return;
  end if;

  if v_target_group.status <> 'open' then
    raise exception 'Grup tujuan sedang ditutup.';
  end if;

  if exists (
    select 1
    from public.qurban_participants
    where group_id = p_target_group_id
      and normalized_phone = v_participant.normalized_phone
  ) then
    raise exception 'Nomor WhatsApp ini sudah terdaftar pada grup yang sama.';
  end if;

  v_capacity := public.qurban_get_capacity(v_target_group.animal_type);

  select count(*) into v_filled
  from public.qurban_participants
  where group_id = p_target_group_id;

  if v_filled >= v_capacity then
    raise exception '% % sudah penuh. Maksimal % peserta sesuai aturan syariah.',
      case v_target_group.animal_type
        when 'cow' then 'Sapi'
        when 'goat' then 'Kambing'
        else 'Domba'
      end,
      v_target_group.name,
      v_capacity;
  end if;

  update public.qurban_participants
  set group_id = p_target_group_id
  where id = p_participant_id;

  update public.qurban_groups
  set updated_at = timezone('utc', now())
  where id in (v_source_group.id, v_target_group.id);

  return query
  select *
  from public.qurban_participants
  where id = p_participant_id;
end;
$$;

create or replace function public.qurban_delete_participant(p_participant_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_id text;
begin
  select group_id into v_group_id
  from public.qurban_participants
  where id = p_participant_id;

  delete from public.qurban_participants
  where id = p_participant_id;

  if not found then
    raise exception 'Peserta tidak ditemukan.';
  end if;

  update public.qurban_groups
  set updated_at = timezone('utc', now())
  where id = v_group_id;
end;
$$;

alter table public.mosque_profiles enable row level security;
alter table public.qurban_groups enable row level security;
alter table public.qurban_participants enable row level security;

drop policy if exists "public_can_read_mosque_profiles" on public.mosque_profiles;
create policy "public_can_read_mosque_profiles"
on public.mosque_profiles
for select
to anon, authenticated
using (true);

drop policy if exists "public_can_read_qurban_groups" on public.qurban_groups;
create policy "public_can_read_qurban_groups"
on public.qurban_groups
for select
to anon, authenticated
using (true);

drop policy if exists "public_can_read_qurban_participants" on public.qurban_participants;
create policy "public_can_read_qurban_participants"
on public.qurban_participants
for select
to authenticated
using (true);

revoke all on public.mosque_profiles from anon, authenticated;
revoke all on public.qurban_groups from anon, authenticated;
revoke all on public.qurban_participants from anon, authenticated;
revoke all on function public.qurban_create_group(text, public.qurban_animal_type, integer, public.qurban_group_status, text) from anon, authenticated;
revoke all on function public.qurban_update_group(text, text, public.qurban_animal_type, integer, public.qurban_group_status, text) from anon, authenticated;
revoke all on function public.qurban_delete_group(text) from anon, authenticated;
revoke all on function public.qurban_register_participant(text, text, text, text, text, public.qurban_payment_status) from anon, authenticated;
revoke all on function public.qurban_move_participant(text, text) from anon, authenticated;
revoke all on function public.qurban_delete_participant(text) from anon, authenticated;

grant select on public.mosque_profiles to anon, authenticated;
grant select on public.qurban_groups to anon, authenticated;
grant select on public.qurban_participants to authenticated;
