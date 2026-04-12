import { DashboardMobileHeader, DashboardMobileNav, DashboardSidebar } from '@/components/dashboard/sidebar';
import { hasAdminAccess } from '@/lib/config/authz';
import { requireDashboardUser } from '@/lib/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, staffUser } = await requireDashboardUser({ next: '/dashboard' });
  const isAdmin = hasAdminAccess(staffUser);

  return (
    <div className="dashboard-layout">
      <DashboardSidebar userEmail={user.email ?? 'Staff aktif'} role={staffUser.role} isAdmin={isAdmin} />
      <DashboardMobileHeader />
      <main className="dashboard-main">
        <div className="dashboard-content-wrapper">
          {children}
        </div>
      </main>
      <DashboardMobileNav isAdmin={isAdmin} />
    </div>
  );
}
