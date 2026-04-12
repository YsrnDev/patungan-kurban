import Link from 'next/link';
import { Users, Plus } from 'lucide-react';

import { ParticipantsManager } from '@/components/dashboard/participants-manager';
import { AddParticipantModal } from '@/components/dashboard/add-participant-modal';
import { AppAlert } from '@/components/ui/app-alert';
import { PageHeader } from '@/components/ui/page-header';
import { requireOperationalUser } from '@/lib/auth';
import { getDashboardData } from '@/lib/services/qurban-service';

interface ParticipantsPageProps {
  searchParams: {
    success?: string;
    error?: string;
    modal?: string;
  };
}

export default async function ParticipantsPage({ searchParams }: ParticipantsPageProps) {
  await requireOperationalUser({ next: '/dashboard/participants' });
  const { groups, participants } = await getDashboardData();
  const openGroups = groups.filter((group) => group.status === 'open' && !group.isFull);

  const hasOpenGroups = openGroups.length > 0;
  const hasGroups = groups.length > 0;

  const openGroupsForModal = openGroups.map((group) => ({
    id: group.id,
    name: group.name,
    slotsLeft: group.slotsLeft,
  }));

  return (
    <div className="section-gap-md">
      <PageHeader
        eyebrow="Manajemen Peserta"
        title="Kelola peserta dengan mudah"
        description="Tambahkan peserta manual, cari data lebih cepat, pantau status pembayaran, lalu pindahkan peserta antar grup tanpa kehilangan konteks."
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
            <p className="text-sm text-stone-500 dark:text-stone-400">Total Peserta</p>
            <p className="text-2xl font-bold text-pine dark:text-stone-100">{participants.length}</p>
          </div>
        </div>

        <Link
          href="/dashboard/participants?modal=add"
          className="button-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Tambah Peserta
        </Link>
      </div>

      <ParticipantsManager groups={groups} participants={participants} />

      <AddParticipantModal
        openGroups={openGroupsForModal}
        hasGroups={hasGroups}
        hasOpenGroups={hasOpenGroups}
      />
    </div>
  );
}
