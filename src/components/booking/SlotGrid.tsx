import { Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SlotGridProps {
  slots: { time: string; available: boolean }[];
  selected: string[];
  onToggle: (time: string) => void;
  emptyHint?: string;
}

export function SlotGrid({ slots, selected, onToggle, emptyHint }: SlotGridProps) {
  if (slots.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-ink-500">
        <Clock className="w-8 h-8 mx-auto mb-2 text-ink-400" />
        {emptyHint || '当日没有可预约时段'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {slots.map(slot => {
        const isSel = selected.includes(slot.time);
        const disabled = !slot.available;
        return (
          <button
            key={slot.time}
            disabled={disabled}
            onClick={() => onToggle(slot.time)}
            className={cn(
              'h-12 rounded-xl text-sm font-medium tabular-nums transition-all press-shrink',
              'border',
              isSel
                ? 'bg-brand-500 text-white border-brand-500 shadow-brand'
                : disabled
                  ? 'bg-cream-50 text-ink-400 border-cream-200 line-through cursor-not-allowed'
                  : 'bg-white text-ink-900 border-cream-200 hover:border-brand-300 hover:bg-brand-50',
            )}
          >
            {slot.time}
          </button>
        );
      })}
    </div>
  );
}
