'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { logAuditEvent } from '@/lib/audit';
import { requireAdminUser, requireOperationalUser } from '@/lib/auth';
import type { AppRole } from '@/lib/config/authz';
import {
  getGroupErrorFlashCode,
  getParticipantErrorFlashCode,
  getStaffErrorFlashCode,
  type RegisterFlashCode,
} from '@/lib/flash';
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

function redirectWithFlash(path: string, key: 'success' | 'error', code: string) {
  redirect(`${path}?${key}=${encodeURIComponent(code)}`);
}

function getActionErrorMessage(error: unknown, fallbackMessage: string) {
  return (
    error instanceof ValidationError ||
    error instanceof StaffUsersTableMissingError ||
    error instanceof StaffUserAlreadyExistsError ||
    error instanceof StaffUserNotFoundError
      ? error.message
      : fallbackMessage
  );
}

function handleActionError(path: string, code: string) {
  redirectWithFlash(path, 'error', code);
}

const PUBLIC_REGISTRATION_COOLDOWN_COOKIE = 'public_registration_cooldown';
const PUBLIC_REGISTRATION_COOLDOWN_SECONDS = 45;
const PUBLIC_REGISTRATION_MIN_FILL_TIME_MS = 3_000;

function setPublicRegistrationCooldown() {
  const cookieStore = cookies();

  cookieStore.set(PUBLIC_REGISTRATION_COOLDOWN_COOKIE, String(Date.now()), {
    httpOnly: true,
    maxAge: PUBLIC_REGISTRATION_COOLDOWN_SECONDS,
    path: '/register',
    sameSite: 'lax',
  });
}

function isPublicRegistrationBlockedByCooldown() {
  const cookieStore = cookies();

  return cookieStore.has(PUBLIC_REGISTRATION_COOLDOWN_COOKIE);
}

function isSuspiciousPublicRegistrationSubmission(formData: FormData) {
  const honeypot = asString(formData.get('website')).trim();
  if (honeypot) {
    return true;
  }

  const submittedAt = Number(asString(formData.get('submittedAt')));
  if (!Number.isFinite(submittedAt) || submittedAt <= 0) {
    return true;
  }

  return Date.now() - submittedAt < PUBLIC_REGISTRATION_MIN_FILL_TIME_MS;
}

function buildAuditActor(context: Awaited<ReturnType<typeof requireOperationalUser>> | Awaited<ReturnType<typeof requireAdminUser>>) {
  return {
    userId: context.user.id,
    email: context.user.email,
    role: context.staffUser.role,
  };
}

export async function submitPublicRegistration(formData: FormData) {
  if (isPublicRegistrationBlockedByCooldown()) {
    redirectWithFlash('/register', 'error', 'registration_cooldown');
  }

  if (isSuspiciousPublicRegistrationSubmission(formData)) {
    redirectWithFlash('/register', 'error', 'registration_failed');
  }

  try {
    await registerParticipant({
      fullName: asString(formData.get('fullName')),
      phone: asString(formData.get('phone')),
      city: asString(formData.get('city')),
      notes: asString(formData.get('notes')),
      groupId: asString(formData.get('groupId')),
    });
  } catch (error) {
    const hasKnownValidationError = error instanceof ValidationError;
    const errorCode: RegisterFlashCode = hasKnownValidationError ? 'registration_failed' : 'registration_failed';
    redirectWithFlash('/register', 'error', errorCode);
  }

  setPublicRegistrationCooldown();
  revalidatePath('/');
  revalidatePath('/register');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/groups');
  revalidatePath('/dashboard/participants');
  redirectWithFlash('/register', 'success', 'registration_submitted');
}

export async function createGroupAction(formData: FormData) {
  const context = await requireOperationalUser({ next: '/dashboard/groups' });

  try {
    const group = await createGroup({
      name: asString(formData.get('name')),
      animalType: asString(formData.get('animalType')) as AnimalType,
      pricePerSlot: Number(asString(formData.get('pricePerSlot'))),
      status: asString(formData.get('status')) as GroupStatus,
      notes: asString(formData.get('notes')),
    });
    await logAuditEvent({
      action: 'group.create',
      entityType: 'group',
      entityId: group.id,
      actor: buildAuditActor(context),
      metadata: { animalType: group.animalType, status: group.status },
    });
  } catch (error) {
    handleActionError(
      '/dashboard/groups',
      getGroupErrorFlashCode(getActionErrorMessage(error, 'Gagal membuat grup.'), 'group_create_failed'),
    );
  }

  revalidatePath('/');
  revalidatePath('/register');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/groups');
  redirectWithFlash('/dashboard/groups', 'success', 'group_created');
}

export async function updateGroupAction(formData: FormData) {
  const groupId = asString(formData.get('groupId'));
  const context = await requireOperationalUser({ next: '/dashboard/groups' });

  try {
    const group = await updateGroup(groupId, {
      name: asString(formData.get('name')),
      animalType: asString(formData.get('animalType')) as AnimalType,
      pricePerSlot: Number(asString(formData.get('pricePerSlot'))),
      status: asString(formData.get('status')) as GroupStatus,
      notes: asString(formData.get('notes')),
    });
    await logAuditEvent({
      action: 'group.update',
      entityType: 'group',
      entityId: group.id,
      actor: buildAuditActor(context),
      metadata: { animalType: group.animalType, status: group.status },
    });
  } catch (error) {
    handleActionError(
      '/dashboard/groups',
      getGroupErrorFlashCode(getActionErrorMessage(error, 'Gagal memperbarui grup.'), 'group_update_failed'),
    );
  }

  revalidatePath('/');
  revalidatePath('/register');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/groups');
  redirectWithFlash('/dashboard/groups', 'success', 'group_updated');
}

export async function deleteGroupAction(formData: FormData) {
  const groupId = asString(formData.get('groupId'));
  const context = await requireOperationalUser({ next: '/dashboard/groups' });

  try {
    await deleteGroup(groupId);
    await logAuditEvent({
      action: 'group.delete',
      entityType: 'group',
      entityId: groupId,
      actor: buildAuditActor(context),
    });
  } catch (error) {
    handleActionError(
      '/dashboard/groups',
      getGroupErrorFlashCode(getActionErrorMessage(error, 'Gagal menghapus grup.'), 'group_delete_failed'),
    );
  }

  revalidatePath('/');
  revalidatePath('/register');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/groups');
  redirectWithFlash('/dashboard/groups', 'success', 'group_deleted');
}

export async function addParticipantAction(formData: FormData) {
  const context = await requireOperationalUser({ next: '/dashboard/participants' });

  try {
    const participant = await addParticipantByAdmin({
      fullName: asString(formData.get('fullName')),
      phone: asString(formData.get('phone')),
      city: asString(formData.get('city')),
      notes: asString(formData.get('notes')),
      groupId: asString(formData.get('groupId')),
      paymentStatus: asString(formData.get('paymentStatus')) as PaymentStatus,
    });
    await logAuditEvent({
      action: 'participant.create',
      entityType: 'participant',
      entityId: participant.id,
      actor: buildAuditActor(context),
      metadata: { groupId: participant.groupId, paymentStatus: participant.paymentStatus },
    });
  } catch (error) {
    handleActionError(
      '/dashboard/participants',
      getParticipantErrorFlashCode(getActionErrorMessage(error, 'Gagal menambahkan peserta.'), 'participant_add_failed'),
    );
  }

  revalidatePath('/');
  revalidatePath('/register');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/participants');
  redirectWithFlash('/dashboard/participants', 'success', 'participant_added');
}

export async function moveParticipantAction(formData: FormData) {
  const context = await requireOperationalUser({ next: '/dashboard/participants' });
  const participantId = asString(formData.get('participantId'));
  const targetGroupId = asString(formData.get('targetGroupId'));

  try {
    const participant = await moveParticipant(participantId, targetGroupId);
    await logAuditEvent({
      action: 'participant.move',
      entityType: 'participant',
      entityId: participant.id,
      actor: buildAuditActor(context),
      metadata: { groupId: participant.groupId, targetGroupId },
    });
  } catch (error) {
    handleActionError(
      '/dashboard/participants',
      getParticipantErrorFlashCode(getActionErrorMessage(error, 'Gagal memindahkan peserta.'), 'participant_move_failed'),
    );
  }

  revalidatePath('/');
  revalidatePath('/register');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/participants');
  redirectWithFlash('/dashboard/participants', 'success', 'participant_moved');
}

export async function updatePaymentStatusAction(formData: FormData) {
  const context = await requireOperationalUser({ next: '/dashboard/participants' });
  const participantId = asString(formData.get('participantId'));
  const paymentStatus = asString(formData.get('paymentStatus')) as PaymentStatus;

  try {
    const participant = await updateParticipantPayment(participantId, paymentStatus);
    await logAuditEvent({
      action: 'participant.payment.update',
      entityType: 'participant',
      entityId: participant.id,
      actor: buildAuditActor(context),
      metadata: { paymentStatus: participant.paymentStatus },
    });
  } catch (error) {
    handleActionError(
      '/dashboard/participants',
      getParticipantErrorFlashCode(getActionErrorMessage(error, 'Gagal memperbarui status pembayaran.'), 'participant_payment_failed'),
    );
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/participants');
  redirectWithFlash('/dashboard/participants', 'success', 'participant_payment_updated');
}

export async function deleteParticipantAction(formData: FormData) {
  const context = await requireOperationalUser({ next: '/dashboard/participants' });
  const participantId = asString(formData.get('participantId'));

  try {
    await deleteParticipant(participantId);
    await logAuditEvent({
      action: 'participant.delete',
      entityType: 'participant',
      entityId: participantId,
      actor: buildAuditActor(context),
    });
  } catch (error) {
    handleActionError(
      '/dashboard/participants',
      getParticipantErrorFlashCode(getActionErrorMessage(error, 'Gagal menghapus peserta.'), 'participant_delete_failed'),
    );
  }

  revalidatePath('/');
  revalidatePath('/register');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/participants');
  redirectWithFlash('/dashboard/participants', 'success', 'participant_deleted');
}

export async function logoutAction() {
  const { createSupabaseServerClient } = await import('@/lib/supabase/server');
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}

export async function createStaffUserAction(formData: FormData) {
  const context = await requireAdminUser({ next: '/dashboard/staff' });

  try {
    const staffUser = await createStaffUser({
      email: asString(formData.get('email')),
      fullName: asString(formData.get('fullName')),
      role: asString(formData.get('role')) as AppRole,
      notes: asString(formData.get('notes')),
      invitedByEmail: context.user.email,
    });
    await logAuditEvent({
      action: 'staff_user.create',
      entityType: 'staff_user',
      entityId: staffUser.id,
      actor: buildAuditActor(context),
      metadata: { role: staffUser.role, email: staffUser.email },
    });
  } catch (error) {
    handleActionError(
      '/dashboard/staff',
      getStaffErrorFlashCode(getActionErrorMessage(error, 'Gagal menambahkan staff user.'), 'staff_create_failed'),
    );
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/staff');
  redirectWithFlash('/dashboard/staff', 'success', 'staff_created');
}

export async function updateStaffUserAction(formData: FormData) {
  const context = await requireAdminUser({ next: '/dashboard/staff' });
  const staffUserId = asString(formData.get('staffUserId'));

  try {
    const staffUser = await updateStaffUser(staffUserId, {
      fullName: asString(formData.get('fullName')),
      role: asString(formData.get('role')) as AppRole,
      notes: asString(formData.get('notes')),
    });
    await logAuditEvent({
      action: 'staff_user.update',
      entityType: 'staff_user',
      entityId: staffUser.id,
      actor: buildAuditActor(context),
      metadata: { role: staffUser.role, email: staffUser.email },
    });
  } catch (error) {
    handleActionError(
      '/dashboard/staff',
      getStaffErrorFlashCode(getActionErrorMessage(error, 'Gagal memperbarui staff user.'), 'staff_update_failed'),
    );
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/staff');
  redirectWithFlash('/dashboard/staff', 'success', 'staff_updated');
}

export async function deactivateStaffUserAction(formData: FormData) {
  const context = await requireAdminUser({ next: '/dashboard/staff' });
  const staffUserId = asString(formData.get('staffUserId'));

  try {
    const staffUser = await setStaffUserActiveStatus(staffUserId, false);
    await logAuditEvent({
      action: 'staff_user.deactivate',
      entityType: 'staff_user',
      entityId: staffUser.id,
      actor: buildAuditActor(context),
      metadata: { email: staffUser.email },
    });
  } catch (error) {
    handleActionError(
      '/dashboard/staff',
      getStaffErrorFlashCode(getActionErrorMessage(error, 'Gagal menonaktifkan staff user.'), 'staff_deactivate_failed'),
    );
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/staff');
  redirectWithFlash('/dashboard/staff', 'success', 'staff_deactivated');
}

export async function reactivateStaffUserAction(formData: FormData) {
  const context = await requireAdminUser({ next: '/dashboard/staff' });
  const staffUserId = asString(formData.get('staffUserId'));

  try {
    const staffUser = await setStaffUserActiveStatus(staffUserId, true);
    await logAuditEvent({
      action: 'staff_user.reactivate',
      entityType: 'staff_user',
      entityId: staffUser.id,
      actor: buildAuditActor(context),
      metadata: { email: staffUser.email },
    });
  } catch (error) {
    handleActionError(
      '/dashboard/staff',
      getStaffErrorFlashCode(getActionErrorMessage(error, 'Gagal mengaktifkan kembali staff user.'), 'staff_reactivate_failed'),
    );
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/staff');
  redirectWithFlash('/dashboard/staff', 'success', 'staff_reactivated');
}
