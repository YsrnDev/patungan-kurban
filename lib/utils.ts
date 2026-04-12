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

export function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
