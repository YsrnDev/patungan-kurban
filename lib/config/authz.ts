export type AppRole = 'admin' | 'panitia';

export interface RoleAwareStaffUser {
  role: AppRole;
  isActive: boolean;
}

export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? '').trim().toLowerCase();
}

export function hasDashboardAccess(staffUser: RoleAwareStaffUser | null | undefined): boolean {
  return Boolean(staffUser?.isActive);
}

export function hasOperationalAccess(staffUser: RoleAwareStaffUser | null | undefined): boolean {
  return Boolean(staffUser?.isActive && (staffUser.role === 'admin' || staffUser.role === 'panitia'));
}

export function hasAdminAccess(staffUser: RoleAwareStaffUser | null | undefined): boolean {
  return Boolean(staffUser?.isActive && staffUser.role === 'admin');
}
