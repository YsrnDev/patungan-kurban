import { normalizeEmail, type AppRole } from '@/lib/config/authz';

const STAFF_USERS_TABLE = 'staff_users';
const STAFF_USER_COLUMNS = [
  'id',
  'email',
  'full_name',
  'role',
  'is_active',
  'notes',
  'invited_by_email',
  'created_at',
  'updated_at',
  'deactivated_at',
  'last_login_at',
].join(', ');

type QueryableSupabaseClient = {
  from: (table: string) => any;
};

interface StaffUserRow {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  is_active: boolean;
  notes: string | null;
  invited_by_email: string | null;
  created_at: string;
  updated_at: string;
  deactivated_at: string | null;
  last_login_at: string | null;
}

export interface StaffUserRecord {
  id: string;
  email: string;
  fullName: string | null;
  role: AppRole;
  isActive: boolean;
  notes: string | null;
  invitedByEmail: string | null;
  createdAt: string;
  updatedAt: string;
  deactivatedAt: string | null;
  lastLoginAt: string | null;
}

export interface CreateStaffUserInput {
  email: string;
  fullName?: string;
  role: AppRole;
  notes?: string;
  invitedByEmail?: string | null;
}

export interface UpdateStaffUserInput {
  fullName?: string;
  role?: AppRole;
  notes?: string;
}

export class StaffUsersTableMissingError extends Error {
  constructor() {
    super('Supabase table staff_users belum tersedia. Jalankan migration SQL staff user terlebih dahulu.');
    this.name = 'StaffUsersTableMissingError';
  }
}

export class StaffUserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`Staff user ${email} sudah terdaftar.`);
    this.name = 'StaffUserAlreadyExistsError';
  }
}

export class StaffUserNotFoundError extends Error {
  constructor() {
    super('Staff user tidak ditemukan.');
    this.name = 'StaffUserNotFoundError';
  }
}

function mapStaffUser(row: StaffUserRow): StaffUserRecord {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    isActive: row.is_active,
    notes: row.notes,
    invitedByEmail: row.invited_by_email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deactivatedAt: row.deactivated_at,
    lastLoginAt: row.last_login_at,
  };
}

function cleanNullableText(value: string | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  return error?.code === '42P01' || error?.message?.toLowerCase().includes('staff_users') === true;
}

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === '23505';
}

function assertSupabaseResult(error: { code?: string; message?: string } | null): void {
  if (!error) {
    return;
  }

  if (isMissingTableError(error)) {
    throw new StaffUsersTableMissingError();
  }

  throw new Error(error.message || 'Supabase query untuk staff user gagal dijalankan.');
}

async function getAdminClient(): Promise<QueryableSupabaseClient> {
  const { createSupabaseAdminClient } = await import('@/lib/supabase/admin');
  return createSupabaseAdminClient();
}

export async function getStaffUserByEmail(
  email: string | null | undefined,
  options?: {
    supabase?: QueryableSupabaseClient;
    allowInactive?: boolean;
  },
): Promise<StaffUserRecord | null> {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return null;
  }

  const supabase = options?.supabase ?? (await getAdminClient());
  let query = supabase.from(STAFF_USERS_TABLE).select(STAFF_USER_COLUMNS).eq('email', normalizedEmail);

  if (!options?.allowInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query.maybeSingle();
  assertSupabaseResult(error);

  return data ? mapStaffUser(data as StaffUserRow) : null;
}

export async function listStaffUsers(): Promise<StaffUserRecord[]> {
  const supabase = await getAdminClient();
  const { data, error } = await supabase
    .from(STAFF_USERS_TABLE)
    .select(STAFF_USER_COLUMNS)
    .order('is_active', { ascending: false })
    .order('role', { ascending: true })
    .order('email', { ascending: true });

  assertSupabaseResult(error);

  return ((data ?? []) as StaffUserRow[]).map(mapStaffUser);
}

export async function createStaffUser(input: CreateStaffUserInput): Promise<StaffUserRecord> {
  const supabase = await getAdminClient();
  const payload = {
    email: normalizeEmail(input.email),
    full_name: cleanNullableText(input.fullName),
    role: input.role,
    is_active: true,
    notes: cleanNullableText(input.notes),
    invited_by_email: cleanNullableText(input.invitedByEmail ?? undefined),
    deactivated_at: null,
  };

  const { data, error } = await supabase
    .from(STAFF_USERS_TABLE)
    .insert(payload)
    .select(STAFF_USER_COLUMNS)
    .single();

  if (isUniqueViolation(error)) {
    throw new StaffUserAlreadyExistsError(payload.email);
  }

  assertSupabaseResult(error);

  return mapStaffUser(data as StaffUserRow);
}

export async function updateStaffUser(staffUserId: string, input: UpdateStaffUserInput): Promise<StaffUserRecord> {
  const supabase = await getAdminClient();
  const payload = {
    full_name: cleanNullableText(input.fullName),
    role: input.role,
    notes: cleanNullableText(input.notes),
  };

  const { data, error } = await supabase
    .from(STAFF_USERS_TABLE)
    .update(payload)
    .eq('id', staffUserId)
    .select(STAFF_USER_COLUMNS)
    .maybeSingle();

  assertSupabaseResult(error);

  if (!data) {
    throw new StaffUserNotFoundError();
  }

  return mapStaffUser(data as StaffUserRow);
}

export async function setStaffUserActiveStatus(staffUserId: string, isActive: boolean): Promise<StaffUserRecord> {
  const supabase = await getAdminClient();
  const { data, error } = await supabase
    .from(STAFF_USERS_TABLE)
    .update({
      is_active: isActive,
      deactivated_at: isActive ? null : new Date().toISOString(),
    })
    .eq('id', staffUserId)
    .select(STAFF_USER_COLUMNS)
    .maybeSingle();

  assertSupabaseResult(error);

  if (!data) {
    throw new StaffUserNotFoundError();
  }

  return mapStaffUser(data as StaffUserRow);
}

export async function recordStaffLogin(email: string | null | undefined): Promise<void> {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return;
  }

  const supabase = await getAdminClient();
  const { error } = await supabase
    .from(STAFF_USERS_TABLE)
    .update({ last_login_at: new Date().toISOString() })
    .eq('email', normalizedEmail)
    .eq('is_active', true);

  assertSupabaseResult(error);
}
