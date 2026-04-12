import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type {
  AnimalType,
  GroupStatus,
  MosqueProfile,
  Participant,
  PaymentStatus,
  QurbanGroup,
} from '@/lib/types';

const MOSQUE_COLUMNS = [
  'id',
  'name',
  'city',
  'campaign_year',
  'registration_deadline',
  'contact_phone',
  'bank_info',
].join(', ');

const GROUP_COLUMNS = [
  'id',
  'name',
  'animal_type',
  'price_per_slot',
  'status',
  'notes',
  'created_at',
  'updated_at',
].join(', ');

const PARTICIPANT_COLUMNS = [
  'id',
  'group_id',
  'full_name',
  'phone',
  'city',
  'notes',
  'payment_status',
  'registered_at',
].join(', ');

interface MosqueRow {
  id: string;
  name: string;
  city: string;
  campaign_year: number;
  registration_deadline: string;
  contact_phone: string;
  bank_info: string;
}

interface GroupRow {
  id: string;
  name: string;
  animal_type: AnimalType;
  price_per_slot: number;
  status: GroupStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ParticipantRow {
  id: string;
  group_id: string;
  full_name: string;
  phone: string;
  city: string;
  notes: string | null;
  payment_status: PaymentStatus;
  registered_at: string;
}

interface SupabaseErrorLike {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

export interface InsertParticipantParams {
  groupId: string;
  fullName: string;
  phone: string;
  city: string;
  notes: string;
  paymentStatus: PaymentStatus;
}

export interface UpdateGroupParams {
  groupId: string;
  name: string;
  animalType: AnimalType;
  pricePerSlot: number;
  status: GroupStatus;
  notes: string;
}

const QURBAN_TABLE_HINTS = ['mosque_profiles', 'qurban_groups', 'qurban_participants', 'qurban_'];

function mapMosque(row: MosqueRow): MosqueProfile {
  return {
    name: row.name,
    city: row.city,
    campaignYear: row.campaign_year,
    registrationDeadline: row.registration_deadline,
    contactPhone: row.contact_phone,
    bankInfo: row.bank_info,
  };
}

function mapGroup(row: GroupRow): QurbanGroup {
  return {
    id: row.id,
    name: row.name,
    animalType: row.animal_type,
    pricePerSlot: row.price_per_slot,
    status: row.status,
    notes: row.notes ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapParticipant(row: ParticipantRow): Participant {
  return {
    id: row.id,
    groupId: row.group_id,
    fullName: row.full_name,
    phone: row.phone,
    city: row.city,
    notes: row.notes ?? '',
    paymentStatus: row.payment_status,
    registeredAt: row.registered_at,
  };
}

function pickSingle<T>(data: T | T[] | null): T | null {
  if (Array.isArray(data)) {
    return data[0] ?? null;
  }

  return data;
}

function isMissingQurbanSchemaError(error: SupabaseErrorLike | null): boolean {
  if (!error) return false;
  if (error.code === '42P01' || error.code === '42883' || error.code === '42704') return true;

  const haystack = `${error.message ?? ''} ${error.details ?? ''} ${error.hint ?? ''}`.toLowerCase();
  return QURBAN_TABLE_HINTS.some((hint) => haystack.includes(hint));
}

function isUniqueViolation(error: SupabaseErrorLike | null): boolean {
  return error?.code === '23505';
}

function toRepositoryError(error: SupabaseErrorLike | null, fallbackMessage: string): Error {
  if (isMissingQurbanSchemaError(error)) {
    return new Error(
      'Schema qurban di Supabase belum tersedia. Jalankan migration SQL qurban terlebih dahulu sebelum memakai data bisnis.',
    );
  }

  return new Error(error?.message || fallbackMessage);
}

function assertSupabaseResult(error: SupabaseErrorLike | null, fallbackMessage: string): void {
  if (!error) return;
  throw toRepositoryError(error, fallbackMessage);
}

export async function getMosqueProfileRecord(): Promise<MosqueProfile> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('mosque_profiles').select(MOSQUE_COLUMNS).order('created_at').limit(1).maybeSingle();

  assertSupabaseResult(error, 'Gagal membaca profil masjid dari Supabase.');

  if (!data) {
    throw new Error('Profil masjid belum tersedia di Supabase. Jalankan seed qurban untuk membuat data awal.');
  }

  return mapMosque(data as unknown as MosqueRow);
}

export async function listQurbanGroups(): Promise<QurbanGroup[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('qurban_groups').select(GROUP_COLUMNS);

  assertSupabaseResult(error, 'Gagal membaca grup qurban dari Supabase.');

  return ((data ?? []) as unknown as GroupRow[]).map(mapGroup);
}

export async function listQurbanParticipants(): Promise<Participant[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('qurban_participants').select(PARTICIPANT_COLUMNS);

  assertSupabaseResult(error, 'Gagal membaca peserta qurban dari Supabase.');

  return ((data ?? []) as unknown as ParticipantRow[]).map(mapParticipant);
}

export async function insertParticipantWithCapacityCheck(input: InsertParticipantParams): Promise<Participant> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc('qurban_register_participant', {
    p_group_id: input.groupId,
    p_full_name: input.fullName,
    p_phone: input.phone,
    p_city: input.city,
    p_notes: input.notes,
    p_payment_status: input.paymentStatus,
  });

  if (isUniqueViolation(error)) {
    throw new Error('Nomor WhatsApp ini sudah terdaftar pada grup yang sama.');
  }

  assertSupabaseResult(error, 'Gagal menyimpan peserta qurban ke Supabase.');

  const row = pickSingle(data as unknown as ParticipantRow | ParticipantRow[] | null);
  if (!row) {
    throw new Error('Supabase tidak mengembalikan data peserta yang baru disimpan.');
  }

  return mapParticipant(row);
}

export async function createGroupRecord(input: Omit<UpdateGroupParams, 'groupId'>): Promise<QurbanGroup> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc('qurban_create_group', {
    p_name: input.name,
    p_animal_type: input.animalType,
    p_price_per_slot: input.pricePerSlot,
    p_status: input.status,
    p_notes: input.notes,
  });

  assertSupabaseResult(error, 'Gagal membuat grup qurban di Supabase.');

  const row = pickSingle(data as unknown as GroupRow | GroupRow[] | null);
  if (!row) {
    throw new Error('Supabase tidak mengembalikan data grup yang baru dibuat.');
  }

  return mapGroup(row);
}

export async function updateGroupRecord(input: UpdateGroupParams): Promise<QurbanGroup> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc('qurban_update_group', {
    p_group_id: input.groupId,
    p_name: input.name,
    p_animal_type: input.animalType,
    p_price_per_slot: input.pricePerSlot,
    p_status: input.status,
    p_notes: input.notes,
  });

  assertSupabaseResult(error, 'Gagal memperbarui grup qurban di Supabase.');

  const row = pickSingle(data as unknown as GroupRow | GroupRow[] | null);
  if (!row) {
    throw new Error('Supabase tidak mengembalikan data grup yang diperbarui.');
  }

  return mapGroup(row);
}

export async function deleteGroupRecord(groupId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.rpc('qurban_delete_group', {
    p_group_id: groupId,
  });

  assertSupabaseResult(error, 'Gagal menghapus grup qurban di Supabase.');
}

export async function moveParticipantRecord(participantId: string, targetGroupId: string): Promise<Participant> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc('qurban_move_participant', {
    p_participant_id: participantId,
    p_target_group_id: targetGroupId,
  });

  if (isUniqueViolation(error)) {
    throw new Error('Nomor WhatsApp ini sudah terdaftar pada grup yang sama.');
  }

  assertSupabaseResult(error, 'Gagal memindahkan peserta di Supabase.');

  const row = pickSingle(data as unknown as ParticipantRow | ParticipantRow[] | null);
  if (!row) {
    throw new Error('Supabase tidak mengembalikan data peserta yang dipindahkan.');
  }

  return mapParticipant(row);
}

export async function updateParticipantPaymentRecord(
  participantId: string,
  paymentStatus: PaymentStatus,
): Promise<Participant> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('qurban_participants')
    .update({ payment_status: paymentStatus })
    .eq('id', participantId)
    .select(PARTICIPANT_COLUMNS)
    .maybeSingle();

  assertSupabaseResult(error, 'Gagal memperbarui status pembayaran peserta di Supabase.');

  if (!data) {
    throw new Error('Peserta tidak ditemukan.');
  }

  return mapParticipant(data as unknown as ParticipantRow);
}

export async function deleteParticipantRecord(participantId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.rpc('qurban_delete_participant', {
    p_participant_id: participantId,
  });

  assertSupabaseResult(error, 'Gagal menghapus peserta di Supabase.');
}
