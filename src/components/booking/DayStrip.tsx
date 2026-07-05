import { cn, shortDate } from '../../lib/utils';
import { WEEKDAY_SHORT } from '../../lib/types';
import { parseDate } from '../../lib/utils';

interface DayStripProps {
  days: string[];
  value: string;
  onChange: (d: string) => void;
  /** 每日可用数量映射，用于显示小数字 */
  availabilityMap?: Record<string, number>;
  className?: string;
}

export function DayStrip({ days, value, onChange, availabilityMap, className }: DayStripProps) {
  return (
    <div className={cn('flex gap-2 overflow-x-auto no-scrollbar pb-1', className)}>
      {days.map(d => {
        const date = parseDate(d);
        const wd = date.getDay();
        const active = d === value;
        const avail = availabilityMap?.[d];
        return (
          <button
            key={d}
            onClick={() => onChange(d)}
            className={cn(
              'shrink-0 w-14 h-20 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all press-shrink',
              'border',
              active
                ? 'bg-brand-500 text-white border-brand-500 shadow-brand'
                : 'bg-white text-ink-900 border-cream-200 hover:border-brand-200',
            )}
          >
            <span className={cn('text-xs', active ? 'text-white/80' : 'text-ink-400')}>
              {WEEKDAY_SHORT[wd]}
            </span>
            <span className="text-xl font-semibold tabular-nums font-serif">
              {date.getDate()}
            </span>
            {avail !== undefined && (
              <span
                className={cn(
                  'text-[10px]',
                  active ? 'text-white/90' : avail > 0 ? 'text-brand-500' : 'text-ink-400',
                )}
              >
                {avail > 0 ? `${avail}可约` : '休息'}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// 避免未使用 import 警告
void shortDate;
