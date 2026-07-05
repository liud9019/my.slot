import { Clock, Video, Phone, MapPin, User, MessageSquare } from 'lucide-react';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { cn, friendlyDate, formatDuration } from '../../lib/utils';
import { FORMAT_LABELS, type Booking } from '../../lib/types';

interface BookingCardProps {
  booking: Booking;
  /** 是否为预约者视角（显示发布者信息） */
  asBooker?: boolean;
  onClick?: () => void;
  className?: string;
}

const formatIcon = {
  offline: MapPin,
  video: Video,
  phone: Phone,
};

export function BookingCard({ booking, asBooker, onClick, className }: BookingCardProps) {
  const Icon = formatIcon[booking.eventSnapshot.format];
  const totalMin = booking.slots.length * booking.eventSnapshot.durationMin;

  return (
    <Card
      hover={!!onClick}
      onClick={onClick}
      padding="none"
      className={cn('overflow-hidden', className)}
    >
      <div className="flex">
        <div
          className="w-1 shrink-0"
          style={{ backgroundColor: booking.eventSnapshot.color }}
        />
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs text-ink-500 mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="tabular-nums">{friendlyDate(booking.date)}</span>
                <span>·</span>
                <span className="tabular-nums">{booking.slots[0]}</span>
                {booking.slots.length > 1 && (
                  <span className="text-ink-400">+{booking.slots.length - 1}</span>
                )}
              </div>
              <h3 className="font-semibold text-ink-900 font-serif text-base truncate">
                {booking.eventSnapshot.name}
              </h3>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
            <span className="inline-flex items-center gap-1">
              <Icon className="w-3.5 h-3.5" />
              {FORMAT_LABELS[booking.eventSnapshot.format]}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(totalMin)}
            </span>
            {asBooker ? (
              <span className="inline-flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {booking.publisherSnapshot.name}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {booking.clientName} · {booking.clientPhone}
              </span>
            )}
          </div>

          {booking.note && (
            <div className="mt-2 flex items-start gap-1.5 text-xs text-ink-500 bg-cream-50 rounded-lg p-2.5">
              <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{booking.note}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
