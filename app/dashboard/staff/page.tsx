import Link from 'next/link';
import { Users, Shield, Plus } from 'lucide-react';

import { AddStaffModal } from '@/components/dashboard/add-staff-modal';
import { StaffUserTable } from '@/components/dashboard/staff-user-table';
import { AppAlert } from '@/components/ui/app-alert';
import { PageHeader } from '@/components/ui/page-header';
import { requireAdminUser } from '@/lib/auth';
import { listStaffUsers } from '@/lib/services/staff-user-service';

interface StaffPageProps {
  searchParams: {
    success?: string;
    error?: string;
    modal?: string;
  };
}

export default async function StaffPage({ searchParams }: StaffPageProps) {
  const { user } = await requireAdminUser({ next: '/dashboard/staff' });
  const staffUsers = await listStaffUsers();

  return (
    <div className="section-gap-md">
      <PageHeader
        eyebrow="Akses Staff"
        title="Kelola admin dan panitia dengan struktur yang lebih mudah dipantau"
        description="Halaman ini tetap khusus admin, dengan fokus pada kejelasan status aktif, role, dan catatan operasional tiap akun."
        meta={
          <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
            <Shield className="h-4 w-4" />
            <span>Akses: <span className="font-semibold text-pine dark:text-gold">{user.email}</span></span>
          </div>
        }
      />

      {searchParams.success ? (
        <AppAlert tone="success">{searchParams.success}</AppAlert>
      ) : null}

      {searchParams.error ? (
        <AppAlert tone="error">{searchParams.error}</AppAlert>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pine/10 text-pine dark:bg-pine/20 dark:text-emerald-100">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-stone-500 dark:text-stone-400">Total Staff</p>
            <p className="text-2xl font-bold text-pine dark:text-stone-100">{staffUsers.length}</p>
          </div>
        </div>

        <Link
          href="/dashboard/staff?modal=add"
          className="button-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Tambah Staff
        </Link>
      </div>

      <StaffUserTable staffUsers={staffUsers} currentUserEmail={user.email} />

      <AddStaffModal />
    </div>
  );
}
