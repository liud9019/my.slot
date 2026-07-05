import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Video, Phone, ChevronRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { cn, formatDuration } from '../../lib/utils';
import { FORMAT_LABELS, type EventType } from '../../lib/types';

interface EventCardProps {
  event: EventType;
  weeklyCount?: number;
  /** 是否可点击进入预约 */
  clickable?: boolean;
  to?: string;
  rightSlot?: React.ReactNode;
}

const formatIcon = {
  offline: MapPin,
  video: Video,
  phone: Phone,
};

export function EventCard({ event, weeklyCount, clickable, to, rightSlot }: EventCardProps) {
  const navigate = useNavigate();
  const Icon = formatIcon[event.format];

  const handle = () => {
    if (!clickable) return;
    if (to) navigate(to);
  };

  return (
    <Card
      hover={clickable}
      onClick={handle}
      padding="none"
      className={cn('overflow-hidden', !event.active && 'opacity-60')}
    >
      <div className="flex">
        <div
          className="w-1.5 shrink-0"
          style={{ backgroundColor: event.color }}
        />
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-ink-900 font-serif text-base truncate">
                {event.name}
              </h3>
              <div className="mt-1 flex items-center gap-3 text-xs text-ink-500">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDuration(event.durationMin)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Icon className="w-3.5 h-3.5" />
                  {FORMAT_LABELS[event.format]}
                </span>
              </div>
            </div>
            {rightSlot || (clickable && (
              <ChevronRight className="w-4 h-4 text-ink-400 shrink-0 mt-1" />
            ))}
          </div>
          {event.description && (
            <p className="mt-2 text-sm text-ink-500 line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          )}
          {typeof weeklyCount === 'number' && (
            <div className="mt-3 flex items-center gap-2 text-xs text-ink-400">
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: event.color }} />
                本周 {weeklyCount} 个预约
              </span>
              {!event.active && (
                <span className="px-1.5 py-0.5 rounded bg-cream-200 text-ink-500">已停用</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
