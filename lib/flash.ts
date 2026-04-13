export type RegisterFlashCode = 'registration_submitted' | 'registration_failed' | 'registration_cooldown';
export type LoginFlashCode = 'supabase_env_missing';
export type GroupsFlashCode =
  | 'group_created'
  | 'group_updated'
  | 'group_deleted'
  | 'group_create_failed'
  | 'group_update_failed'
  | 'group_delete_failed'
  | 'group_name_invalid'
  | 'group_animal_invalid'
  | 'group_status_invalid'
  | 'group_price_invalid';
export type ParticipantsFlashCode =
  | 'participant_added'
  | 'participant_moved'
  | 'participant_payment_updated'
  | 'participant_deleted'
  | 'participant_add_failed'
  | 'participant_move_failed'
  | 'participant_payment_failed'
  | 'participant_delete_failed'
  | 'participant_name_invalid'
  | 'participant_phone_invalid'
  | 'participant_city_invalid'
  | 'participant_group_required'
  | 'participant_payment_invalid'
  | 'participant_group_full';
export type StaffFlashCode =
  | 'staff_created'
  | 'staff_updated'
  | 'staff_deactivated'
  | 'staff_reactivated'
  | 'staff_create_failed'
  | 'staff_update_failed'
  | 'staff_deactivate_failed'
  | 'staff_reactivate_failed'
  | 'staff_exists'
  | 'staff_not_found'
  | 'staff_table_missing';

const registerFlashMessages: Record<RegisterFlashCode, { tone: 'success' | 'error'; message: string }> = {
  registration_submitted: {
    tone: 'success',
    message: 'Pendaftaran berhasil dikirim. Panitia akan menindaklanjuti verifikasi pembayaran melalui WhatsApp.',
  },
  registration_failed: {
    tone: 'error',
    message: 'Pendaftaran belum dapat diproses. Pastikan grup masih tersedia lalu coba kembali.',
  },
  registration_cooldown: {
    tone: 'error',
    message: 'Silakan tunggu sebentar sebelum mengirim ulang.',
  },
};

const loginFlashMessages: Record<LoginFlashCode, { tone: 'error'; message: string }> = {
  supabase_env_missing: {
    tone: 'error',
    message: 'Konfigurasi Supabase publik belum lengkap.',
  },
};

const groupsFlashMessages: Record<GroupsFlashCode, { tone: 'success' | 'error'; message: string }> = {
  group_created: {
    tone: 'success',
    message: 'Grup baru berhasil ditambahkan.',
  },
  group_updated: {
    tone: 'success',
    message: 'Grup berhasil diperbarui.',
  },
  group_deleted: {
    tone: 'success',
    message: 'Grup berhasil dihapus.',
  },
  group_create_failed: {
    tone: 'error',
    message: 'Gagal membuat grup.',
  },
  group_update_failed: {
    tone: 'error',
    message: 'Gagal memperbarui grup.',
  },
  group_delete_failed: {
    tone: 'error',
    message: 'Gagal menghapus grup.',
  },
  group_name_invalid: {
    tone: 'error',
    message: 'Nama grup minimal 4 karakter.',
  },
  group_animal_invalid: {
    tone: 'error',
    message: 'Jenis hewan tidak dikenali.',
  },
  group_status_invalid: {
    tone: 'error',
    message: 'Status grup tidak valid.',
  },
  group_price_invalid: {
    tone: 'error',
    message: 'Harga per slot harus lebih besar dari 0.',
  },
};

const participantsFlashMessages: Record<ParticipantsFlashCode, { tone: 'success' | 'error'; message: string }> = {
  participant_added: {
    tone: 'success',
    message: 'Peserta berhasil ditambahkan.',
  },
  participant_moved: {
    tone: 'success',
    message: 'Peserta berhasil dipindahkan.',
  },
  participant_payment_updated: {
    tone: 'success',
    message: 'Status pembayaran berhasil diperbarui.',
  },
  participant_deleted: {
    tone: 'success',
    message: 'Peserta berhasil dihapus.',
  },
  participant_add_failed: {
    tone: 'error',
    message: 'Gagal menambahkan peserta.',
  },
  participant_move_failed: {
    tone: 'error',
    message: 'Gagal memindahkan peserta.',
  },
  participant_payment_failed: {
    tone: 'error',
    message: 'Gagal memperbarui status pembayaran.',
  },
  participant_delete_failed: {
    tone: 'error',
    message: 'Gagal menghapus peserta.',
  },
  participant_name_invalid: {
    tone: 'error',
    message: 'Nama peserta minimal 3 karakter.',
  },
  participant_phone_invalid: {
    tone: 'error',
    message: 'Nomor WhatsApp belum valid.',
  },
  participant_city_invalid: {
    tone: 'error',
    message: 'Domisili wajib diisi.',
  },
  participant_group_required: {
    tone: 'error',
    message: 'Pilih grup kurban yang tersedia.',
  },
  participant_payment_invalid: {
    tone: 'error',
    message: 'Status pembayaran tidak valid.',
  },
  participant_group_full: {
    tone: 'error',
    message: 'Grup yang dipilih sudah penuh.',
  },
};

const staffFlashMessages: Record<StaffFlashCode, { tone: 'success' | 'error'; message: string }> = {
  staff_created: {
    tone: 'success',
    message: 'Staff user berhasil ditambahkan.',
  },
  staff_updated: {
    tone: 'success',
    message: 'Staff user berhasil diperbarui.',
  },
  staff_deactivated: {
    tone: 'success',
    message: 'Staff user berhasil dinonaktifkan.',
  },
  staff_reactivated: {
    tone: 'success',
    message: 'Staff user berhasil diaktifkan kembali.',
  },
  staff_create_failed: {
    tone: 'error',
    message: 'Gagal menambahkan staff user.',
  },
  staff_update_failed: {
    tone: 'error',
    message: 'Gagal memperbarui staff user.',
  },
  staff_deactivate_failed: {
    tone: 'error',
    message: 'Gagal menonaktifkan staff user.',
  },
  staff_reactivate_failed: {
    tone: 'error',
    message: 'Gagal mengaktifkan kembali staff user.',
  },
  staff_exists: {
    tone: 'error',
    message: 'Email staff sudah terdaftar.',
  },
  staff_not_found: {
    tone: 'error',
    message: 'Data staff tidak ditemukan.',
  },
  staff_table_missing: {
    tone: 'error',
    message: 'Tabel staff belum tersedia.',
  },
};

export function resolveRegisterFlash(code?: string) {
  if (!code) {
    return null;
  }

  return registerFlashMessages[code as RegisterFlashCode] ?? null;
}

export function resolveLoginFlash(code?: string) {
  if (!code) {
    return null;
  }

  return loginFlashMessages[code as LoginFlashCode] ?? null;
}

export function resolveGroupsFlash(code?: string) {
  if (!code) {
    return null;
  }

  return groupsFlashMessages[code as GroupsFlashCode] ?? null;
}

export function resolveParticipantsFlash(code?: string) {
  if (!code) {
    return null;
  }

  return participantsFlashMessages[code as ParticipantsFlashCode] ?? null;
}

export function resolveStaffFlash(code?: string) {
  if (!code) {
    return null;
  }

  return staffFlashMessages[code as StaffFlashCode] ?? null;
}

export function getGroupErrorFlashCode(message: string, fallbackCode: GroupsFlashCode): GroupsFlashCode {
  switch (message) {
    case 'Nama grup minimal 4 karakter.':
      return 'group_name_invalid';
    case 'Jenis hewan tidak dikenali.':
      return 'group_animal_invalid';
    case 'Status grup tidak valid.':
      return 'group_status_invalid';
    case 'Harga per slot harus lebih besar dari 0.':
      return 'group_price_invalid';
    default:
      return fallbackCode;
  }
}

export function getParticipantErrorFlashCode(message: string, fallbackCode: ParticipantsFlashCode): ParticipantsFlashCode {
  switch (message) {
    case 'Nama peserta minimal 3 karakter.':
      return 'participant_name_invalid';
    case 'Nomor WhatsApp belum valid.':
      return 'participant_phone_invalid';
    case 'Domisili wajib diisi.':
      return 'participant_city_invalid';
    case 'Pilih grup kurban yang tersedia.':
      return 'participant_group_required';
    case 'Status pembayaran tidak valid.':
      return 'participant_payment_invalid';
    default:
      return message.includes('sudah penuh') ? 'participant_group_full' : fallbackCode;
  }
}

export function getStaffErrorFlashCode(message: string, fallbackCode: StaffFlashCode): StaffFlashCode {
  if (message.startsWith('Staff user ') && message.endsWith(' sudah terdaftar.')) {
    return 'staff_exists';
  }

  switch (message) {
    case 'Staff user tidak ditemukan.':
      return 'staff_not_found';
    case 'Supabase table staff_users belum tersedia. Jalankan migration SQL staff user terlebih dahulu.':
      return 'staff_table_missing';
    default:
      return fallbackCode;
  }
}

export function getLoginFlashCodeForAuthReason(reason: string | null): LoginFlashCode | null {
  if (reason === 'supabase_env_missing') {
    return 'supabase_env_missing';
  }

  return null;
}
