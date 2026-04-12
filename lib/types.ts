export type AnimalType = 'cow' | 'goat' | 'sheep';

export type GroupStatus = 'open' | 'closed';

export type PaymentStatus = 'pending' | 'partial' | 'paid';

export interface MosqueProfile {
  name: string;
  city: string;
  campaignYear: number;
  registrationDeadline: string;
  contactPhone: string;
  bankInfo: string;
}

export interface QurbanGroup {
  id: string;
  name: string;
  animalType: AnimalType;
  pricePerSlot: number;
  status: GroupStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: string;
  groupId: string;
  fullName: string;
  phone: string;
  city: string;
  notes: string;
  paymentStatus: PaymentStatus;
  registeredAt: string;
}

export interface GroupWithStats extends QurbanGroup {
  filledSlots: number;
  capacity: number;
  slotsLeft: number;
  participants: Participant[];
  isUrgent: boolean;
  isFull: boolean;
}

export interface RegistrationInput {
  fullName: string;
  phone: string;
  city: string;
  notes?: string;
  groupId: string;
}

export interface GroupInput {
  name: string;
  animalType: AnimalType;
  pricePerSlot: number;
  status: GroupStatus;
  notes: string;
}

export interface ParticipantInput extends RegistrationInput {
  paymentStatus: PaymentStatus;
}

export interface DashboardMetrics {
  totalParticipants: number;
  openGroups: number;
  urgentGroups: number;
  fullGroups: number;
  availableSlots: number;
}

export interface PaymentStatusSummaryItem {
  status: PaymentStatus;
  label: string;
  count: number;
  percentage: number;
  estimatedValue: number;
}

export interface GroupReportItem extends GroupWithStats {
  occupancyRate: number;
  occupancyLabel: string;
  paymentPaidCount: number;
  paymentPartialCount: number;
  paymentPendingCount: number;
  occupiedValue: number;
  remainingValue: number;
  potentialValue: number;
}

export interface ParticipantReportItem extends Participant {
  groupName: string;
  animalType: AnimalType | null;
  paymentLabel: string;
  pricePerSlot: number;
  groupStatus: GroupStatus | null;
}

export interface ReportCitySummaryItem {
  city: string;
  count: number;
}

export interface ReportHighlightItem {
  title: string;
  detail: string;
  tone: 'success' | 'warning' | 'info';
}

export interface ReportsSummary {
  totalParticipants: number;
  totalGroups: number;
  openGroups: number;
  closedGroups: number;
  fullGroups: number;
  urgentGroups: number;
  availableSlots: number;
  totalCapacity: number;
  occupiedSlots: number;
  occupancyRate: number;
  paidParticipants: number;
  partialParticipants: number;
  pendingParticipants: number;
  paidRate: number;
  partialRate: number;
  pendingRate: number;
  participantsWithNotes: number;
  distinctCities: number;
  projectedRevenueTotal: number;
  occupiedRevenue: number;
  remainingRevenue: number;
}

export interface DashboardReportsData {
  mosque: MosqueProfile;
  generatedAt: string;
  metrics: DashboardMetrics;
  summary: ReportsSummary;
  paymentBreakdown: PaymentStatusSummaryItem[];
  groups: GroupReportItem[];
  participants: ParticipantReportItem[];
  topCities: ReportCitySummaryItem[];
  highlights: ReportHighlightItem[];
}
