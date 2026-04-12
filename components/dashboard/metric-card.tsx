import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  note?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'highlight' | 'urgent';
}

const variantClassMap: Record<NonNullable<MetricCardProps['variant']>, string> = {
  default: 'bg-pine/10 text-pine dark:bg-pine/20 dark:text-emerald-100',
  highlight: 'bg-amber-100/80 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  urgent: 'bg-rose-100/80 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

export function MetricCard({ label, value, note, icon: Icon, variant = 'default' }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="flex items-start gap-4">
        {Icon && (
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition ${variantClassMap[variant]}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="metric-label">{label}</p>
          <p className="metric-value mt-1">{value}</p>
          {note ? <p className="metric-note mt-1 text-xs">{note}</p> : null}
        </div>
      </div>
    </div>
  );
}

interface MetricCardCompactProps {
  label: string;
  value: string | number;
  note: string;
}

export function MetricCardCompact({ label, value, note }: MetricCardCompactProps) {
  return (
    <div className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value mt-3">{value}</p>
      <p className="metric-note mt-2">{note}</p>
    </div>
  );
}
