import type { PaymentStatus } from '@/lib/types';
import { paymentStatusLabel } from '@/lib/utils';
import { StatusBadge } from '@/components/status-badge';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const tone = status === 'paid' ? 'success' : status === 'partial' ? 'warning' : 'muted';

  return <StatusBadge label={paymentStatusLabel(status)} tone={tone} />;
}
