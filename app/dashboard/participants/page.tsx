import { ParticipantsManager } from '@/components/dashboard/participants-manager';
import { AddParticipantModal } from '@/components/dashboard/add-participant-modal';
import { AppAlert } from '@/components/ui/app-alert';
import { PageHeader } from '@/components/ui/page-header';
import { requireOperationalUser } from '@/lib/auth';
import { resolveParticipantsFlash } from '@/lib/flash';
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
  const successFlash = resolveParticipantsFlash(searchParams.success);
  const errorFlash = resolveParticipantsFlash(searchParams.error);

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

      {successFlash ? (
        <AppAlert tone={successFlash.tone}>{successFlash.message}</AppAlert>
      ) : null}
      {errorFlash ? (
        <AppAlert tone={errorFlash.tone}>{errorFlash.message}</AppAlert>
      ) : null}

      <ParticipantsManager groups={groups} participants={participants} />

      <AddParticipantModal
        openGroups={openGroupsForModal}
        hasGroups={hasGroups}
        hasOpenGroups={hasOpenGroups}
      />
    </div>
  );
}
