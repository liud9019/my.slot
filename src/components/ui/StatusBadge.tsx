import { cn } from '../../lib/utils';
import { STATUS_LABELS, STATUS_COLORS, type BookingStatus } from '../../lib/types';

interface StatusBadgeProps {
  status: BookingStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({ status, size = 'sm', className }: StatusBadgeProps) {
  const color = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        className,
      )}
      style={{
        backgroundColor: `${color}1A`,
        color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
