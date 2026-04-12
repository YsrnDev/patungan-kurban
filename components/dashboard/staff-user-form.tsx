import { Users, Shield, AlertCircle } from 'lucide-react';
import { createStaffUserAction } from '@/lib/actions';

export function StaffUserForm() {
  return (
    <form action={createStaffUserAction} className="panel space-y-5 p-6">
      <div>
        <p className="form-section-title">Tambah Staff</p>
        <h2 className="form-section-subtitle">Buat akun admin atau panitia</h2>
        <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-300">
          Tambahkan email staff yang diizinkan login via magic link. Akun akan aktif untuk otorisasi dashboard setelah
          record ini tersimpan di Supabase.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-stone-500" />
            Email staff
          </label>
          <input name="email" type="email" placeholder="panitia@masjidnurulhuda.id" required />
        </div>
        <div>
          <label className="mb-2 flex items-center gap-2">
            <Users className="h-4 w-4 text-stone-500" />
            Nama tampil
          </label>
          <input name="fullName" placeholder="Contoh: Panitia Kurban 1" />
        </div>
        <div>
          <label className="mb-2 block">Role</label>
          <select name="role" defaultValue="panitia">
            <option value="admin">Admin</option>
            <option value="panitia">Panitia</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block">Catatan</label>
          <textarea name="notes" placeholder="Catatan penugasan, PIC lapangan, atau informasi internal" />
        </div>
      </div>

      <div className="info-card">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-800/80 dark:text-amber-300/80">
            Pastikan email ini juga digunakan saat menerima magic link login agar proses autentikasi tidak terhambat.
          </p>
        </div>
      </div>

      <button type="submit" className="button-primary w-full">
        Simpan Staff User
      </button>
    </form>
  );
}
