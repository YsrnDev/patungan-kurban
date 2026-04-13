import { AnimalType, PaymentStatus } from '@/lib/types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function animalTypeOrder(type: AnimalType): number {
  if (type === 'cow') return 0;
  if (type === 'goat') return 1;
  return 2;
}

export function paymentStatusLabel(status: PaymentStatus): string {
  if (status === 'paid') return 'Lunas';
  if (status === 'partial') return 'DP';
  return 'Menunggu';
}

export function formatPercent(value: number, digits = 0): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export interface OccupancyProgress {
  filledSlots: number;
  capacity: number;
  ratio: number;
  percent: number;
  label: string;
}

export function getOccupancyProgress(filledSlots: number, capacity: number): OccupancyProgress {
  const safeFilledSlots = Number.isFinite(filledSlots) ? Math.max(filledSlots, 0) : 0;
  const safeCapacity = Number.isFinite(capacity) ? Math.max(capacity, 0) : 0;
  const unclampedRatio = safeCapacity > 0 ? safeFilledSlots / safeCapacity : 0;
  const ratio = Math.min(Math.max(unclampedRatio, 0), 1);

  return {
    filledSlots: safeFilledSlots,
    capacity: safeCapacity,
    ratio,
    percent: ratio * 100,
    label: formatPercent(ratio, 0),
  };
}

export function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
