import Link from 'next/link';
import { Shield } from 'lucide-react';

import { AddStaffModal } from '@/components/dashboard/add-staff-modal';
import { StaffUserTable } from '@/components/dashboard/staff-user-table';
import { AppAlert } from '@/components/ui/app-alert';
import { PageHeader } from '@/components/ui/page-header';
import { requireAdminUser } from '@/lib/auth';
import { resolveStaffFlash } from '@/lib/flash';
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
  const successFlash = resolveStaffFlash(searchParams.success);
  const errorFlash = resolveStaffFlash(searchParams.error);

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

      {successFlash ? (
        <AppAlert tone={successFlash.tone}>{successFlash.message}</AppAlert>
      ) : null}

      {errorFlash ? (
        <AppAlert tone={errorFlash.tone}>{errorFlash.message}</AppAlert>
      ) : null}
      <StaffUserTable staffUsers={staffUsers} currentUserEmail={user.email} />

      <AddStaffModal />
    </div>
  );
}
