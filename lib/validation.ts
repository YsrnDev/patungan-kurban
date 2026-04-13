import { AnimalType, GroupInput, ParticipantInput, QurbanGroup, RegistrationInput } from '@/lib/types';

const PAYMENT_STATUSES = ['pending', 'partial', 'paid'] as const;
const FULL_NAME_MAX_LENGTH = 120;
const CITY_MAX_LENGTH = 80;
const NOTES_MAX_LENGTH = 500;
const GROUP_NAME_MAX_LENGTH = 120;

function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function cleanOptionalText(value: string | null | undefined): string {
  return normalizeWhitespace(value ?? '');
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function getAnimalCapacity(animalType: AnimalType): number {
  if (animalType === 'cow') return 7;
  return 1;
}

export function getAnimalLabel(animalType: AnimalType): string {
  if (animalType === 'cow') return 'Sapi';
  if (animalType === 'goat') return 'Kambing';
  return 'Domba';
}

export function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  const hasInternationalPrefix = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');

  if (!digitsOnly) {
    return '';
  }

  return `${hasInternationalPrefix ? '+' : ''}${digitsOnly}`;
}

export function validateRegistrationInput(input: RegistrationInput): RegistrationInput {
  const fullName = normalizeWhitespace(input.fullName);
  const city = normalizeWhitespace(input.city);
  const groupId = cleanOptionalText(input.groupId);
  const phone = normalizePhone(input.phone);
  const notes = cleanOptionalText(input.notes);

  if (fullName.length < 3) throw new ValidationError('Nama peserta minimal 3 karakter.');
  if (fullName.length > FULL_NAME_MAX_LENGTH) throw new ValidationError('Nama peserta maksimal 120 karakter.');
  if (phone.length < 10) throw new ValidationError('Nomor WhatsApp belum valid.');
  if (phone.length > 20) throw new ValidationError('Nomor WhatsApp terlalu panjang.');
  if (city.length < 2) throw new ValidationError('Domisili wajib diisi.');
  if (city.length > CITY_MAX_LENGTH) throw new ValidationError('Domisili maksimal 80 karakter.');
  if (!groupId) throw new ValidationError('Pilih grup kurban yang tersedia.');
  if (notes.length > NOTES_MAX_LENGTH) throw new ValidationError('Catatan maksimal 500 karakter.');

  return { fullName, phone, city, groupId, notes };
}

export function validateParticipantInput(input: ParticipantInput): ParticipantInput {
  const base = validateRegistrationInput(input);

  if (!PAYMENT_STATUSES.includes(input.paymentStatus)) {
    throw new ValidationError('Status pembayaran tidak valid.');
  }

  return {
    ...base,
    paymentStatus: input.paymentStatus,
  };
}

export function validateGroupInput(input: GroupInput): GroupInput {
  const name = normalizeWhitespace(input.name);
  const notes = cleanOptionalText(input.notes);

  if (name.length < 4) throw new ValidationError('Nama grup minimal 4 karakter.');
  if (name.length > GROUP_NAME_MAX_LENGTH) throw new ValidationError('Nama grup maksimal 120 karakter.');
  if (!['cow', 'goat', 'sheep'].includes(input.animalType)) {
    throw new ValidationError('Jenis hewan tidak dikenali.');
  }
  if (!['open', 'closed'].includes(input.status)) {
    throw new ValidationError('Status grup tidak valid.');
  }
  if (!Number.isFinite(input.pricePerSlot) || input.pricePerSlot <= 0) {
    throw new ValidationError('Harga per slot harus lebih besar dari 0.');
  }
  if (notes.length > NOTES_MAX_LENGTH) {
    throw new ValidationError('Catatan maksimal 500 karakter.');
  }

  return {
    ...input,
    name,
    notes,
  };
}

export function assertCapacity(group: QurbanGroup, participantCount: number): void {
  const capacity = getAnimalCapacity(group.animalType);
  if (participantCount >= capacity) {
    throw new ValidationError(
      `${getAnimalLabel(group.animalType)} ${group.name} sudah penuh. Maksimal ${capacity} peserta sesuai aturan syariah.`,
    );
  }
}
