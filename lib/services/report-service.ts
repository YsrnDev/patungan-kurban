import 'server-only';

import { unstable_noStore as noStore } from 'next/cache';

import { getDashboardData } from '@/lib/services/qurban-service';
import type {
  DashboardReportsData,
  GroupReportItem,
  ParticipantReportItem,
  PaymentStatusSummaryItem,
  ReportCitySummaryItem,
  ReportHighlightItem,
  ReportsSummary,
} from '@/lib/types';
import { formatCurrency, formatPercent, getOccupancyProgress, paymentStatusLabel } from '@/lib/utils';
import { getAnimalLabel } from '@/lib/validation';

function makePaymentBreakdown(participants: ParticipantReportItem[]): PaymentStatusSummaryItem[] {
  const statuses: Array<PaymentStatusSummaryItem['status']> = ['paid', 'partial', 'pending'];
  const totalParticipants = participants.length;
  const counts = statuses.reduce<Record<PaymentStatusSummaryItem['status'], number>>(
    (result, status) => {
      result[status] = 0;
      return result;
    },
    { paid: 0, partial: 0, pending: 0 }
  );
  const estimatedValues = statuses.reduce<Record<PaymentStatusSummaryItem['status'], number>>(
    (result, status) => {
      result[status] = 0;
      return result;
    },
    { paid: 0, partial: 0, pending: 0 }
  );

  participants.forEach((participant) => {
    counts[participant.paymentStatus] += 1;
    estimatedValues[participant.paymentStatus] += participant.pricePerSlot;
  });

  return statuses.map((status) => ({
    status,
    label: paymentStatusLabel(status),
    count: counts[status],
    percentage: totalParticipants > 0 ? counts[status] / totalParticipants : 0,
    estimatedValue: estimatedValues[status],
  }));
}

function makeGroupReportItems(data: Awaited<ReturnType<typeof getDashboardData>>): GroupReportItem[] {
  return data.groups.map((group) => {
    const paymentPaidCount = group.participants.filter((participant) => participant.paymentStatus === 'paid').length;
    const paymentPartialCount = group.participants.filter((participant) => participant.paymentStatus === 'partial').length;
    const paymentPendingCount = group.participants.filter((participant) => participant.paymentStatus === 'pending').length;
    const occupancy = getOccupancyProgress(group.filledSlots, group.capacity);

    return {
      ...group,
      occupancyRate: occupancy.ratio,
      occupancyLabel: occupancy.label,
      paymentPaidCount,
      paymentPartialCount,
      paymentPendingCount,
      occupiedValue: group.filledSlots * group.pricePerSlot,
      remainingValue: group.slotsLeft * group.pricePerSlot,
      potentialValue: group.capacity * group.pricePerSlot,
    };
  });
}

function makeParticipantReportItems(data: Awaited<ReturnType<typeof getDashboardData>>): ParticipantReportItem[] {
  return [...data.participants]
    .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))
    .map((participant) => {
      const group = data.groups.find((item) => item.id === participant.groupId);

      return {
        ...participant,
        groupName: group?.name ?? 'Tanpa grup',
        animalType: group?.animalType ?? null,
        paymentLabel: paymentStatusLabel(participant.paymentStatus),
        pricePerSlot: group?.pricePerSlot ?? 0,
        groupStatus: group?.status ?? null,
      };
    });
}

function makeReportsSummary(groups: GroupReportItem[], participants: ParticipantReportItem[]): ReportsSummary {
  const totalCapacity = groups.reduce((total, group) => total + group.capacity, 0);
  const occupiedSlots = groups.reduce((total, group) => total + group.filledSlots, 0);
  const paidParticipants = participants.filter((participant) => participant.paymentStatus === 'paid').length;
  const partialParticipants = participants.filter((participant) => participant.paymentStatus === 'partial').length;
  const pendingParticipants = participants.filter((participant) => participant.paymentStatus === 'pending').length;
  const totalParticipants = participants.length;
  const participantsWithNotes = participants.filter((participant) => participant.notes.trim().length > 0).length;
  const distinctCities = new Set(participants.map((participant) => participant.city.trim().toLowerCase()).filter(Boolean)).size;
  const projectedRevenueTotal = groups.reduce((total, group) => total + group.potentialValue, 0);
  const occupiedRevenue = groups.reduce((total, group) => total + group.occupiedValue, 0);
  const remainingRevenue = groups.reduce((total, group) => total + group.remainingValue, 0);

  return {
    totalParticipants,
    totalGroups: groups.length,
    openGroups: groups.filter((group) => group.status === 'open').length,
    closedGroups: groups.filter((group) => group.status === 'closed').length,
    fullGroups: groups.filter((group) => group.isFull).length,
    urgentGroups: groups.filter((group) => group.status === 'open' && group.isUrgent).length,
    availableSlots: groups.filter((group) => group.status === 'open').reduce((total, group) => total + group.slotsLeft, 0),
    totalCapacity,
    occupiedSlots,
    occupancyRate: getOccupancyProgress(occupiedSlots, totalCapacity).ratio,
    paidParticipants,
    partialParticipants,
    pendingParticipants,
    paidRate: totalParticipants > 0 ? paidParticipants / totalParticipants : 0,
    partialRate: totalParticipants > 0 ? partialParticipants / totalParticipants : 0,
    pendingRate: totalParticipants > 0 ? pendingParticipants / totalParticipants : 0,
    participantsWithNotes,
    distinctCities,
    projectedRevenueTotal,
    occupiedRevenue,
    remainingRevenue,
  };
}

function makeTopCities(participants: ParticipantReportItem[]): ReportCitySummaryItem[] {
  const counts = new Map<string, number>();

  participants.forEach((participant) => {
    const key = participant.city.trim();
    if (!key) return;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => (b.count !== a.count ? b.count - a.count : a.city.localeCompare(b.city, 'id')))
    .slice(0, 5);
}

function makeHighlights(summary: ReportsSummary, groups: GroupReportItem[], participants: ParticipantReportItem[]): ReportHighlightItem[] {
  const highlights: ReportHighlightItem[] = [];
  const urgentGroups = groups.filter((group) => group.status === 'open' && group.isUrgent);
  const fullGroups = groups.filter((group) => group.isFull);
  const pendingWithNotes = participants.filter((participant) => participant.paymentStatus === 'pending' && participant.notes.trim().length > 0);

  if (urgentGroups.length > 0) {
    const groupNames = urgentGroups.slice(0, 3).map((group) => group.name).join(', ');
    highlights.push({
      title: 'Grup hampir penuh',
      detail: `${urgentGroups.length} grup aktif tinggal sedikit slot. Prioritaskan follow up pada ${groupNames}${urgentGroups.length > 3 ? ', dan lainnya' : ''}.`,
      tone: 'warning',
    });
  }

  highlights.push({
    title: 'Progres okupansi',
    detail: `${summary.occupiedSlots} dari ${summary.totalCapacity} slot sudah terisi (${formatPercent(summary.occupancyRate, 0)}). Nilai okupansi saat ini setara ${formatCurrency(summary.occupiedRevenue)}.`,
    tone: 'info',
  });

  highlights.push({
    title: 'Pembayaran terkonfirmasi',
    detail: `${summary.paidParticipants} peserta sudah lunas (${formatPercent(summary.paidRate, 0)}), sedangkan ${summary.pendingParticipants} peserta masih menunggu konfirmasi.`,
    tone: summary.pendingParticipants > 0 ? 'warning' : 'success',
  });

  if (fullGroups.length > 0) {
    highlights.push({
      title: 'Grup penuh',
      detail: `${fullGroups.length} grup sudah penuh sehingga dapat diprioritaskan untuk finalisasi administrasi dan kesiapan distribusi.`,
      tone: 'success',
    });
  }

  if (pendingWithNotes.length > 0) {
    highlights.push({
      title: 'Catatan tindak lanjut',
      detail: `${pendingWithNotes.length} peserta berstatus menunggu memiliki catatan operasional. Pastikan catatan ini ditinjau saat follow up pembayaran.`,
      tone: 'info',
    });
  }

  return highlights.slice(0, 5);
}

export function getReportAnimalLabel(animalType: ParticipantReportItem['animalType']): string {
  if (!animalType) return '-';
  return getAnimalLabel(animalType);
}

export async function getDashboardReportsData(): Promise<DashboardReportsData> {
  noStore();

  const data = await getDashboardData();
  const groups = makeGroupReportItems(data);
  const participants = makeParticipantReportItems(data);
  const paymentBreakdown = makePaymentBreakdown(participants);
  const summary = makeReportsSummary(groups, participants);
  const topCities = makeTopCities(participants);
  const highlights = makeHighlights(summary, groups, participants);

  return {
    mosque: data.mosque,
    generatedAt: new Date().toISOString(),
    metrics: data.metrics,
    summary,
    paymentBreakdown,
    groups,
    participants,
    topCities,
    highlights,
  };
}
