interface GroupOccupancyProgressProps {
  percent: number;
  caption: string;
  barClassName: string;
  className?: string;
  trackClassName?: string;
  captionClassName?: string;
}

export function GroupOccupancyProgress({
  percent,
  caption,
  barClassName,
  className,
  trackClassName,
  captionClassName,
}: GroupOccupancyProgressProps) {
  return (
    <div className={className}>
      <div className={trackClassName ?? 'progress-track'}>
        <div className={`progress-bar ${barClassName}`} style={{ width: `${percent}%` }} />
      </div>
      <p className={captionClassName ?? 'mt-1 text-xs text-stone-500 dark:text-stone-400'}>{caption}</p>
    </div>
  );
}
