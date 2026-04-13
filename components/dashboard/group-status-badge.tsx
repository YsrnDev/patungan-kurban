import { StatusBadge } from '@/components/status-badge';
import { GroupStatus } from '@/lib/types';

interface GroupStatusBadgeProps {
  status: GroupStatus;
  isFull: boolean;
  isUrgent: boolean;
  slotsLeft: number;
  className?: string;
  openLabelPrefix?: '' | 'Tersisa ';
}

export function GroupStatusBadge({
  status,
  isFull,
  isUrgent,
  slotsLeft,
  className,
  openLabelPrefix = 'Tersisa ',
}: GroupStatusBadgeProps) {
  return (
    <StatusBadge
      label={isFull ? 'Penuh' : status === 'closed' ? 'Ditutup' : `${openLabelPrefix}${slotsLeft} slot`}
      tone={isFull ? 'muted' : isUrgent ? 'danger' : status === 'closed' ? 'warning' : 'success'}
      className={className}
    />
  );
}
