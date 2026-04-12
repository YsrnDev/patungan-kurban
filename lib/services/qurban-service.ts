import { unstable_noStore as noStore } from 'next/cache';

import {
  DashboardMetrics,
  GroupInput,
  GroupWithStats,
  ParticipantInput,
  Participant,
  QurbanGroup,
  RegistrationInput,
} from '@/lib/types';
import { animalTypeOrder } from '@/lib/utils';
import {
  getAnimalCapacity,
  validateGroupInput,
  validateParticipantInput,
  validateRegistrationInput,
  ValidationError,
} from '@/lib/validation';
import {
  createGroupRecord,
  deleteGroupRecord,
  deleteParticipantRecord,
  getMosqueProfileRecord,
  insertParticipantWithCapacityCheck,
  listQurbanGroups,
  listQurbanParticipants,
  moveParticipantRecord,
  updateGroupRecord,
  updateParticipantPaymentRecord,
} from '@/lib/data/qurban-repository';

async function readQurbanDataset() {
  const [mosque, groups, participants] = await Promise.all([
    getMosqueProfileRecord(),
    listQurbanGroups(),
    listQurbanParticipants(),
  ]);

  return { mosque, groups, participants };
}

function mapGroupsWithStats(groups: QurbanGroup[], participants: Participant[]): GroupWithStats[] {
  return groups
    .map((group) => {
      const groupParticipants = participants
        .filter((participant) => participant.groupId === group.id)
        .sort((a, b) => a.registeredAt.localeCompare(b.registeredAt));
      const capacity = getAnimalCapacity(group.animalType);
      const filledSlots = groupParticipants.length;
      const slotsLeft = Math.max(capacity - filledSlots, 0);

      return {
        ...group,
        participants: groupParticipants,
        capacity,
        filledSlots,
        slotsLeft,
        isUrgent: slotsLeft > 0 && slotsLeft <= 2,
        isFull: slotsLeft === 0,
      };
    })
    .sort((a, b) => {
      const typeCompare = animalTypeOrder(a.animalType) - animalTypeOrder(b.animalType);
      if (typeCompare !== 0) return typeCompare;
      return a.name.localeCompare(b.name, 'id');
    });
}

function makeDashboardMetrics(groups: GroupWithStats[], participantCount: number): DashboardMetrics {
  return {
    totalParticipants: participantCount,
    openGroups: groups.filter((group) => group.status === 'open').length,
    urgentGroups: groups.filter((group) => group.status === 'open' && group.isUrgent).length,
    fullGroups: groups.filter((group) => group.isFull).length,
    availableSlots: groups
      .filter((group) => group.status === 'open')
      .reduce((total, group) => total + group.slotsLeft, 0),
  };
}

export async function getPublicData() {
  noStore();
  const db = await readQurbanDataset();
  const groups = mapGroupsWithStats(db.groups, db.participants);
  const availableGroups = groups.filter((group) => group.status === 'open' && !group.isFull);

  return {
    mosque: db.mosque,
    groups,
    availableGroups,
    metrics: makeDashboardMetrics(groups, db.participants.length),
  };
}

export async function getDashboardData() {
  noStore();
  const db = await readQurbanDataset();
  const groups = mapGroupsWithStats(db.groups, db.participants);
  const recentParticipants = [...db.participants]
    .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))
    .slice(0, 8)
    .map((participant) => ({
      ...participant,
      group: groups.find((group) => group.id === participant.groupId) ?? null,
    }));

  return {
    mosque: db.mosque,
    groups,
    participants: db.participants,
    recentParticipants,
    metrics: makeDashboardMetrics(groups, db.participants.length),
  };
}

export async function registerParticipant(input: RegistrationInput) {
  const payload = validateRegistrationInput(input);
  let participant: Participant;

  try {
    participant = await insertParticipantWithCapacityCheck({
      groupId: payload.groupId,
      fullName: payload.fullName,
      phone: payload.phone,
      city: payload.city,
      notes: payload.notes ?? '',
      paymentStatus: 'pending',
    });
  } catch (error) {
    throw mapMutationError(error, 'Pendaftaran gagal diproses.');
  }

  const group = (await listQurbanGroups()).find((item) => item.id === participant.groupId);

  if (!group) {
    throw new ValidationError('Grup yang dipilih tidak ditemukan.');
  }

  return {
    message: `Pendaftaran atas nama ${payload.fullName} berhasil dicatat pada ${group.name}.`,
  };
}

export async function createGroup(input: GroupInput) {
  const payload = validateGroupInput(input);

  try {
    await createGroupRecord(payload);
  } catch (error) {
    throw mapMutationError(error, 'Gagal membuat grup.');
  }
}

export async function updateGroup(groupId: string, input: GroupInput) {
  const payload = validateGroupInput(input);

  try {
    await updateGroupRecord({ groupId, ...payload });
  } catch (error) {
    throw mapMutationError(error, 'Gagal memperbarui grup.');
  }
}

export async function deleteGroup(groupId: string) {
  try {
    await deleteGroupRecord(groupId);
  } catch (error) {
    throw mapMutationError(error, 'Gagal menghapus grup.');
  }
}

export async function addParticipantByAdmin(input: ParticipantInput) {
  const payload = validateParticipantInput(input);

  try {
    await insertParticipantWithCapacityCheck({
      groupId: payload.groupId,
      fullName: payload.fullName,
      phone: payload.phone,
      city: payload.city,
      notes: payload.notes ?? '',
      paymentStatus: payload.paymentStatus,
    });
  } catch (error) {
    throw mapMutationError(error, 'Gagal menambahkan peserta.');
  }
}

export async function moveParticipant(participantId: string, targetGroupId: string) {
  try {
    await moveParticipantRecord(participantId, targetGroupId);
  } catch (error) {
    throw mapMutationError(error, 'Gagal memindahkan peserta.');
  }
}

export async function updateParticipantPayment(participantId: string, paymentStatus: ParticipantInput['paymentStatus']) {
  try {
    await updateParticipantPaymentRecord(participantId, paymentStatus);
  } catch (error) {
    throw mapMutationError(error, 'Gagal memperbarui status pembayaran peserta.');
  }
}

export async function deleteParticipant(participantId: string) {
  try {
    await deleteParticipantRecord(participantId);
  } catch (error) {
    throw mapMutationError(error, 'Gagal menghapus peserta.');
  }
}

export async function getAvailabilitySnapshot() {
  noStore();
  const data = await getPublicData();

  return {
    mosque: data.mosque,
    updatedAt: new Date().toISOString(),
    groups: data.groups.map((group) => ({
      id: group.id,
      name: group.name,
      animalType: group.animalType,
      status: group.status,
      filledSlots: group.filledSlots,
      capacity: group.capacity,
      slotsLeft: group.slotsLeft,
      isUrgent: group.isUrgent,
    })),
  };
}

function mapMutationError(error: unknown, fallbackMessage: string): ValidationError {
  if (error instanceof ValidationError) {
    return error;
  }

  const message = error instanceof Error ? error.message : fallbackMessage;
  return new ValidationError(message);
}
