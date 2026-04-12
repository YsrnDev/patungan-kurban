'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { requireAdminUser, requireOperationalUser } from '@/lib/auth';
import type { AppRole } from '@/lib/config/authz';
import {
  addParticipantByAdmin,
  createGroup,
  deleteGroup,
  deleteParticipant,
  moveParticipant,
  registerParticipant,
  updateGroup,
  updateParticipantPayment,
} from '@/lib/services/qurban-service';
import {
  createStaffUser,
  setStaffUserActiveStatus,
  StaffUserAlreadyExistsError,
  StaffUserNotFoundError,
  StaffUsersTableMissingError,
  updateStaffUser,
} from '@/lib/services/staff-user-service';
import { AnimalType, GroupStatus, PaymentStatus } from '@/lib/types';
import { ValidationError } from '@/lib/validation';

function asString(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value : '';
}

function handleActionError(error: unknown, fallbackMessage: string, path: string) {
  const message =
    error instanceof ValidationError ||
    error instanceof StaffUsersTableMissingError ||
    error instanceof StaffUserAlreadyExistsError ||
    error instanceof StaffUserNotFoundError
      ? error.message
      : fallbackMessage;
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

async function requireOperationalActionAccess(path: string) {
  await requireOperationalUser({ next: path });
}

export async function submitPublicRegistration(formData: FormData) {
  try {
    await registerParticipant({
      fullName: asString(formData.get('fullName')),
      phone: asString(formData.get('phone')),
      city: asString(formData.get('city')),
      notes: asString(formData.get('notes')),
      groupId: asString(formData.get('groupId')),
    });
  } catch (error) {
    handleActionError(error, 'Pendaftaran gagal disimpan.', '/register');
  }

  revalidatePath('/');
  revalidatePath('/register');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/groups');
  revalidatePath('/dashboard/participants');
  redirect('/register?success=Pendaftaran%20berhasil%20disimpan');
}

export async function createGroupAction(formData: FormData) {
  await requireOperationalActionAccess('/dashboard/groups');

  try {
    await createGroup({
      name: asString(formData.get('name')),
      animalType: asString(formData.get('animalType')) as AnimalType,
      pricePerSlot: Number(asString(formData.get('pricePerSlot'))),
      status: asString(formData.get('status')) as GroupStatus,
      notes: asString(formData.get('notes')),
    });
  } catch (error) {
    handleActionError(error, 'Gagal membuat grup.', '/dashboard/groups');
  }

  revalidatePath('/');
  revalidatePath('/register');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/groups');
  redirect('/dashboard/groups?success=Grup%20baru%20berhasil%20ditambahkan');
}

export async function updateGroupAction(formData: FormData) {
  const groupId = asString(formData.get('groupId'));
  await requireOperationalActionAccess('/dashboard/groups');

  try {
    await updateGroup(groupId, {
      name: asString(formData.get('name')),
      animalType: asString(formData.get('animalType')) as AnimalType,
      pricePerSlot: Number(asString(formData.get('pricePerSlot'))),
      status: asString(formData.get('status')) as GroupStatus,
      notes: asString(formData.get('notes')),
    });
  } catch (error) {
    handleActionError(error, 'Gagal memperbarui grup.', '/dashboard/groups');
  }

  revalidatePath('/');
  revalidatePath('/register');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/groups');
  redirect('/dashboard/groups?success=Grup%20berhasil%20diperbarui');
}

export async function deleteGroupAction(formData: FormData) {
  const groupId = asString(formData.get('groupId'));
  await requireOperationalActionAccess('/dashboard/groups');

  try {
    await deleteGroup(groupId);
  } catch (error) {
    handleActionError(error, 'Gagal menghapus grup.', '/dashboard/groups');
  }

  revalidatePath('/');
  revalidatePath('/register');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/groups');
  redirect('/dashboard/groups?success=Grup%20berhasil%20dihapus');
}

export async function addParticipantAction(formData: FormData) {
  await requireOperationalActionAccess('/dashboard/participants');

  try {
    await addParticipantByAdmin({
      fullName: asString(formData.get('fullName')),
      phone: asString(formData.get('phone')),
      city: asString(formData.get('city')),
      notes: asString(formData.get('notes')),
      groupId: asString(formData.get('groupId')),
      paymentStatus: asString(formData.get('paymentStatus')) as PaymentStatus,
    });
  } catch (error) {
    handleActionError(error, 'Gagal menambahkan peserta.', '/dashboard/participants');
  }

  revalidatePath('/');
  revalidatePath('/register');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/participants');
  redirect('/dashboard/participants?success=Peserta%20berhasil%20ditambahkan');
}

export async function moveParticipantAction(formData: FormData) {
  await requireOperationalActionAccess('/dashboard/participants');

  try {
    await moveParticipant(asString(formData.get('participantId')), asString(formData.get('targetGroupId')));
  } catch (error) {
    handleActionError(error, 'Gagal memindahkan peserta.', '/dashboard/participants');
  }

  revalidatePath('/');
  revalidatePath('/register');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/participants');
  redirect('/dashboard/participants?success=Peserta%20berhasil%20dipindahkan');
}

export async function updatePaymentStatusAction(formData: FormData) {
  await requireOperationalActionAccess('/dashboard/participants');

  try {
    await updateParticipantPayment(
      asString(formData.get('participantId')),
      asString(formData.get('paymentStatus')) as PaymentStatus,
    );
  } catch (error) {
    handleActionError(error, 'Gagal memperbarui status pembayaran.', '/dashboard/participants');
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/participants');
  redirect('/dashboard/participants?success=Status%20pembayaran%20berhasil%20diperbarui');
}

export async function deleteParticipantAction(formData: FormData) {
  await requireOperationalActionAccess('/dashboard/participants');

  try {
    await deleteParticipant(asString(formData.get('participantId')));
  } catch (error) {
    handleActionError(error, 'Gagal menghapus peserta.', '/dashboard/participants');
  }

  revalidatePath('/');
  revalidatePath('/register');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/participants');
  redirect('/dashboard/participants?success=Peserta%20berhasil%20dihapus');
}

export async function logoutAction() {
  const { createSupabaseServerClient } = await import('@/lib/supabase/server');
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}

export async function createStaffUserAction(formData: FormData) {
  const { user } = await requireAdminUser({ next: '/dashboard/staff' });

  try {
    await createStaffUser({
      email: asString(formData.get('email')),
      fullName: asString(formData.get('fullName')),
      role: asString(formData.get('role')) as AppRole,
      notes: asString(formData.get('notes')),
      invitedByEmail: user.email,
    });
  } catch (error) {
    handleActionError(error, 'Gagal menambahkan staff user.', '/dashboard/staff');
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/staff');
  redirect('/dashboard/staff?success=Staff%20user%20berhasil%20ditambahkan');
}

export async function updateStaffUserAction(formData: FormData) {
  await requireAdminUser({ next: '/dashboard/staff' });

  try {
    await updateStaffUser(asString(formData.get('staffUserId')), {
      fullName: asString(formData.get('fullName')),
      role: asString(formData.get('role')) as AppRole,
      notes: asString(formData.get('notes')),
    });
  } catch (error) {
    handleActionError(error, 'Gagal memperbarui staff user.', '/dashboard/staff');
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/staff');
  redirect('/dashboard/staff?success=Staff%20user%20berhasil%20diperbarui');
}

export async function deactivateStaffUserAction(formData: FormData) {
  await requireAdminUser({ next: '/dashboard/staff' });

  try {
    await setStaffUserActiveStatus(asString(formData.get('staffUserId')), false);
  } catch (error) {
    handleActionError(error, 'Gagal menonaktifkan staff user.', '/dashboard/staff');
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/staff');
  redirect('/dashboard/staff?success=Staff%20user%20berhasil%20dinonaktifkan');
}

export async function reactivateStaffUserAction(formData: FormData) {
  await requireAdminUser({ next: '/dashboard/staff' });

  try {
    await setStaffUserActiveStatus(asString(formData.get('staffUserId')), true);
  } catch (error) {
    handleActionError(error, 'Gagal mengaktifkan kembali staff user.', '/dashboard/staff');
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/staff');
  redirect('/dashboard/staff?success=Staff%20user%20berhasil%20diaktifkan%20kembali');
}
