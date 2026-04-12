import { AnimalType, GroupInput, ParticipantInput, QurbanGroup, RegistrationInput } from '@/lib/types';

const PAYMENT_STATUSES = ['pending', 'partial', 'paid'] as const;

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
  return phone.replace(/[^\d+]/g, '').trim();
}

export function validateRegistrationInput(input: RegistrationInput): RegistrationInput {
  const fullName = input.fullName.trim();
  const city = input.city.trim();
  const groupId = input.groupId.trim();
  const phone = normalizePhone(input.phone);
  const notes = input.notes?.trim() ?? '';

  if (fullName.length < 3) throw new ValidationError('Nama peserta minimal 3 karakter.');
  if (phone.length < 10) throw new ValidationError('Nomor WhatsApp belum valid.');
  if (city.length < 2) throw new ValidationError('Domisili wajib diisi.');
  if (!groupId) throw new ValidationError('Pilih grup kurban yang tersedia.');

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
  const name = input.name.trim();
  const notes = input.notes.trim();

  if (name.length < 4) throw new ValidationError('Nama grup minimal 4 karakter.');
  if (!['cow', 'goat', 'sheep'].includes(input.animalType)) {
    throw new ValidationError('Jenis hewan tidak dikenali.');
  }
  if (!['open', 'closed'].includes(input.status)) {
    throw new ValidationError('Status grup tidak valid.');
  }
  if (!Number.isFinite(input.pricePerSlot) || input.pricePerSlot <= 0) {
    throw new ValidationError('Harga per slot harus lebih besar dari 0.');
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
