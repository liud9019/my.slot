import { useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { CheckCircle2, Calendar, Clock, ArrowRight, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { getBooking } from '../../lib/storage';
import { FORMAT_LABELS } from '../../lib/types';
import { friendlyDate, formatDuration } from '../../lib/utils';

interface LocationState {
  bookingId: string;
}

export function Success() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const booking = useMemo(() => {
    if (!state?.bookingId) return null;
    return getBooking(state.bookingId);
  }, [state]);

  if (!booking) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center p-6">
        <p className="text-sm text-ink-500 mb-4">未找到预约信息</p>
        <Button onClick={() => navigate('/my/bookings', { replace: true })}>
          查看我的预约
        </Button>
      </div>
    );
  }

  const totalMin = booking.slots.length * booking.eventSnapshot.durationMin;

  return (
    <div className="min-h-screen bg-aurora">
      <div className="px-5 pt-16 pb-8">
        {/* 成功图标 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-500 mb-4 animate-check-pop shadow-brand">
            <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-ink-900">预约成功</h1>
          <p className="text-sm text-ink-500 mt-2">
            {booking.eventSnapshot.name} · 已自动确认
          </p>
        </div>

        {/* 预约详情 */}
        <Card padding="lg" className="mb-4">
          <div className="flex items-start gap-3">
            <div
              className="w-1.5 self-stretch rounded-full shrink-0"
              style={{ backgroundColor: booking.eventSnapshot.color }}
            />
            <div className="flex-1">
              <h3 className="font-serif font-semibold text-ink-900 text-lg">
                {booking.eventSnapshot.name}
              </h3>
              <p className="text-sm text-ink-500 mt-0.5">
                {booking.publisherSnapshot.name} · {booking.publisherSnapshot.title}
              </p>

              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-center gap-2.5 text-ink-700">
                  <Calendar className="w-4 h-4 text-ink-400" />
                  <span className="tabular-nums">{friendlyDate(booking.date)}</span>
                </div>
                <div className="flex items-center gap-2.5 text-ink-700">
                  <Clock className="w-4 h-4 text-ink-400" />
                  <span className="tabular-nums">
                    {booking.slots[0]}
                    {booking.slots.length > 1 && (
                      <span className="text-ink-400"> 起（共 {booking.slots.length} 个）</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-ink-700">
                  <span className="w-4 text-center text-ink-400">·</span>
                  <span>合计 {formatDuration(totalMin)} · {FORMAT_LABELS[booking.eventSnapshot.format]}</span>
                </div>
              </div>

              {booking.slots.length > 1 && (
                <div className="mt-3 pt-3 border-t border-cream-200">
                  <p className="text-xs text-ink-500 mb-1.5">已选时段</p>
                  <div className="flex flex-wrap gap-1.5">
                    {booking.slots.map(s => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-xs tabular-nums font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* 提示 */}
        <Card padding="md" className="bg-gold-50 border-gold-100 mb-6">
          <p className="text-xs text-gold-600 leading-relaxed">
            我们已为 {booking.clientPhone} 创建预约。如需取消或查看，请在「我的预约」中操作。
          </p>
        </Card>

        {/* 操作 */}
        <div className="space-y-3">
          <Button
            block
            onClick={() => navigate('/my/bookings', { replace: true })}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            查看我的预约
          </Button>
          <Button
            block
            variant="secondary"
            onClick={() => navigate(`/b/${slug || 'demo'}`, { replace: true })}
            icon={<Home className="w-4 h-4" />}
          >
            返回继续预约
          </Button>
        </div>

        <p className="text-center text-[10px] text-ink-400 mt-8">
          预约编号：{booking.id.slice(-8).toUpperCase()}
        </p>
      </div>
    </div>
  );
}
