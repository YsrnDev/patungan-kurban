import { Users, Shield, UserCog, Power } from 'lucide-react';
import { deactivateStaffUserAction, reactivateStaffUserAction, updateStaffUserAction } from '@/lib/actions';
import { type StaffUserRecord } from '@/lib/services/staff-user-service';
import { formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/status-badge';
import { EmptyState } from '@/components/dashboard/empty-state';
import { AutoSubmitSelect } from '@/components/ui/auto-submit-select';

const staffRoleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'panitia', label: 'Panitia' },
] as const;

interface StaffUserTableProps {
  staffUsers: StaffUserRecord[];
  currentUserEmail?: string | null;
}

export function StaffUserTable({ staffUsers, currentUserEmail }: StaffUserTableProps) {
  const hasStaff = staffUsers.length > 0;

  return (
    <div className="table-shell">
      <div className="table-toolbar">
        <div className="table-toolbar-title">
          <div className="table-toolbar-icon bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
            <UserCog className="h-5 w-5" />
          </div>
          <div>
            <p className="section-eyebrow">Daftar Staff</p>
            <h2 className="section-title mt-1">Kelola role dan status akses</h2>
          </div>
        </div>
        <span className="table-toolbar-meta">{staffUsers.length} staff terdaftar</span>
      </div>

      {hasStaff ? (
        <>
          <div className="hidden lg:block">
            <div className="table-scroll">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Staff</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Terakhir Login</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {staffUsers.map((staffUser) => {
                    const isCurrentUser = currentUserEmail?.toLowerCase() === staffUser.email.toLowerCase();

                    return (
                      <tr key={staffUser.id}>
                        <td>
                          <p className="font-semibold text-pine dark:text-stone-100">{staffUser.email}</p>
                          <p className="text-xs text-stone-500 dark:text-stone-400">{staffUser.fullName || 'Tanpa nama'}</p>
                          {isCurrentUser ? <p className="mt-1 text-xs font-medium text-palm dark:text-gold">(Anda)</p> : null}
                        </td>
                        <td>
                          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                            staffUser.role === 'admin'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300'
                              : 'bg-stone-100 text-stone-700 border border-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300'
                          }`}>
                            <Shield className="h-3 w-3" />
                            {staffUser.role === 'admin' ? 'Admin' : 'Panitia'}
                          </span>
                        </td>
                        <td>
                          <StatusBadge
                            label={staffUser.isActive ? 'Aktif' : 'Nonaktif'}
                            tone={staffUser.isActive ? 'success' : 'muted'}
                          />
                        </td>
                        <td>
                          <p className="text-sm text-stone-600 dark:text-stone-300">{staffUser.lastLoginAt ? formatDate(staffUser.lastLoginAt) : '-'}</p>
                          <p className="text-xs text-stone-400 dark:text-stone-500">Dibuat {formatDate(staffUser.createdAt)}</p>
                        </td>
                        <td>
                          <form action={updateStaffUserAction} className="flex flex-wrap items-center gap-2">
                            <input type="hidden" name="staffUserId" value={staffUser.id} />
                            <AutoSubmitSelect
                              name="role"
                              defaultValue={staffUser.role}
                              className="text-xs py-2 px-2 min-w-[100px]"
                              options={staffRoleOptions}
                              aria-label={`Ubah role untuk ${staffUser.email}`}
                            />
                          </form>
                          <div className="mt-2 flex gap-2">
                            {staffUser.isActive ? (
                              <form action={deactivateStaffUserAction}>
                                <input type="hidden" name="staffUserId" value={staffUser.id} />
                                <button type="submit" className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200">
                                  <Power className="h-3 w-3" />
                                  Nonaktifkan
                                </button>
                              </form>
                            ) : (
                              <form action={reactivateStaffUserAction}>
                                <input type="hidden" name="staffUserId" value={staffUser.id} />
                                <button type="submit" className="flex items-center gap-1 text-xs text-palm hover:text-pine dark:text-gold dark:hover:text-amber-200">
                                  <Power className="h-3 w-3" />
                                  Aktifkan
                                </button>
                              </form>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4 p-4 sm:p-5 lg:hidden">
            {staffUsers.map((staffUser) => {
              const isCurrentUser = currentUserEmail?.toLowerCase() === staffUser.email.toLowerCase();

              return (
                <form key={staffUser.id} action={updateStaffUserAction} className="list-row list-row-compact space-y-4 sm:p-5">
                  <input type="hidden" name="staffUserId" value={staffUser.id} />

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-pine dark:text-stone-100">{staffUser.email}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{staffUser.fullName || 'Tanpa nama'}</p>
                    </div>
                    <StatusBadge
                      label={staffUser.isActive ? 'Aktif' : 'Nonaktif'}
                      tone={staffUser.isActive ? 'success' : 'muted'}
                    />
                  </div>

                  <div className="rounded-[20px] bg-sand px-4 py-3 text-sm dark:bg-stone-900/80">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Shield className="h-3 w-3 text-stone-500" />
                        <span className="text-stone-500 dark:text-stone-400">Role:</span>
                        <span className={`font-medium ${staffUser.role === 'admin' ? 'text-blue-700 dark:text-blue-300' : 'text-stone-700 dark:text-stone-200'}`}>
                          {staffUser.role === 'admin' ? 'Admin' : 'Panitia'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-stone-500 dark:text-stone-400">Login:</span>
                        <span className="text-stone-700 dark:text-stone-200">{staffUser.lastLoginAt ? formatDate(staffUser.lastLoginAt) : '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <AutoSubmitSelect
                      name="role"
                      defaultValue={staffUser.role}
                      className="text-xs py-2 px-3 flex-1 touch-target-lg"
                      options={staffRoleOptions}
                      aria-label={`Ubah role untuk ${staffUser.email}`}
                    />
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    {staffUser.isActive ? (
                      <button type="submit" formAction={deactivateStaffUserAction} className="button-muted flex items-center justify-center gap-2 px-3 py-2 text-xs text-amber-700 flex-1 touch-target-lg">
                        <Power className="h-3 w-3" />
                        Nonaktifkan
                      </button>
                    ) : (
                      <button type="submit" formAction={reactivateStaffUserAction} className="button-secondary flex items-center justify-center gap-2 px-3 py-2 text-xs flex-1 touch-target-lg">
                        <Power className="h-3 w-3" />
                        Aktifkan Lagi
                      </button>
                    )}
                  </div>

                  {isCurrentUser && (
                    <p className="text-center text-xs font-medium text-palm dark:text-gold">Akun Anda saat ini</p>
                  )}
                </form>
              );
            })}
          </div>
        </>
      ) : (
        <div className="p-5">
          <EmptyState
            icon={Users}
            title="Belum ada staff"
            description="Tambahkan staff pertama untuk mulai mengelola akses dashboard."
          />
        </div>
      )}
    </div>
  );
}
