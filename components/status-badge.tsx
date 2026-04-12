interface StatusBadgeProps {
  label: string;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'muted';
  className?: string;
}

const toneClassMap: Record<NonNullable<StatusBadgeProps['tone']>, string> = {
  default: 'border-palm/20 bg-palm/10 text-pine dark:border-palm/30 dark:bg-palm/20 dark:text-emerald-100',
  success: 'border-green-200 bg-green-50 text-green-800 dark:border-green-900/70 dark:bg-green-950/30 dark:text-green-300',
  warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-200',
  danger: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300',
  muted: 'border-stone-200 bg-stone-100 text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300',
};

export function StatusBadge({ label, tone = 'default', className = '' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition ${toneClassMap[tone]} ${className}`}>
      {label}
    </span>
  );
}

interface StatusDotProps {
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'muted';
  className?: string;
}

const dotToneClassMap: Record<NonNullable<StatusDotProps['tone']>, string> = {
  default: 'bg-palm',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  muted: 'bg-stone-400',
};

export function StatusDot({ tone = 'default', className = '' }: StatusDotProps) {
  return (
    <span className={`inline-block h-2 w-2 rounded-full ${dotToneClassMap[tone]} ${className}`} />
  );
}
