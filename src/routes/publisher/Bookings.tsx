import { useMemo, useState } from 'react';
import {
  CheckCircle2, XCircle, CalendarCheck, MoreHorizontal,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth';
import { PageHeader } from '../../components/mobile/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Tabs } from '../../components/ui/Tabs';
import { BookingCard } from '../../components/booking/BookingCard';
import { toast } from '../../stores/toast';
import {
  listBookingsByPublisher, updateBookingStatus,
} from '../../lib/storage';
import { formatDate, friendlyDate, nextDays } from '../../lib/utils';
import type { BookingStatus } from '../../lib/types';

type FilterStatus = 'all' | BookingStatus;

export function Bookings() {
  const session = useAuthStore(s => s.session);
  const userId = session?.userId || '';
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [actionMenuFor, setActionMenuFor] = useState<string | null>(null);
  const [tick, setTick] = useState(0);  // 强制重渲染

  const allBookings = useMemo(() => listBookingsByPublisher(userId), [userId, tick]);

  const dateOptions = useMemo(() => {
    const days = nextDays(14);
    return [{ value: 'all', label: '全部' }, ...days.map(d => ({ value: d, label: friendlyDate(d) }))];
  }, []);

  const filtered = useMemo(() => {
    return allBookings.filter(b => {
      if (filter !== 'all' && b.status !== filter) return false;
      if (dateFilter !== 'all' && b.date !== dateFilter) return false;
      return true;
    });
  }, [allBookings, filter, dateFilter]);

  const counts = useMemo(() => {
    return {
      all: allBookings.length,
      pending: allBookings.filter(b => b.status === 'pending').length,
      confirmed: allBookings.filter(b => b.status === 'confirmed').length,
      completed: allBookings.filter(b => b.status === 'completed').length,
      cancelled: allBookings.filter(b => b.status === 'cancelled').length,
    };
  }, [allBookings]);

  const handleAction = (id: string, action: 'confirm' | 'cancel' | 'complete') => {
    const map = {
      confirm: { status: 'confirmed' as const, msg: '已确认预约' },
      cancel: { status: 'cancelled' as const, msg: '已取消预约' },
      complete: { status: 'completed' as const, msg: '已标记完成' },
    };
    updateBookingStatus(id, map[action].status);
    toast.success(map[action].msg);
    setActionMenuFor(null);
    setTick(t => t + 1);
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <PageHeader title="预约管理" subtitle={`共 ${allBookings.length} 条`} backFallback="/publisher" />

      <div className="px-5 pt-4 pb-2 space-y-3 sticky top-14 z-20 bg-cream-50">
        <Tabs<FilterStatus>
          value={filter}
          onChange={setFilter}
          tabs={[
            { key: 'all', label: '全部', count: counts.all },
            { key: 'confirmed', label: '已确认', count: counts.confirmed },
            { key: 'pending', label: '待确认', count: counts.pending },
            { key: 'completed', label: '已完成', count: counts.completed },
            { key: 'cancelled', label: '已取消', count: counts.cancelled },
          ]}
        />

        {/* 日期横向滚动 */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {dateOptions.map(d => (
            <button
              key={d.value}
              onClick={() => setDateFilter(d.value)}
              className={`shrink-0 h-8 px-3 rounded-full text-xs font-medium transition-all press-shrink ${
                dateFilter === d.value
                  ? 'bg-ink-900 text-white'
                  : 'bg-white text-ink-500 border border-cream-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 pt-3">
        {filtered.length === 0 ? (
          <Card padding="lg">
            <EmptyState
              icon={<CalendarCheck className="w-8 h-8" />}
              title="暂无预约"
              description="符合条件的预约将显示在这里"
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(b => (
              <div key={b.id} className="relative">
                <BookingCard
                  booking={b}
                  onClick={() => setActionMenuFor(actionMenuFor === b.id ? null : b.id)}
                />
                {/* 操作菜单 */}
                {actionMenuFor === b.id && (
                  <Card
                    padding="none"
                    className="absolute right-3 top-3 z-10 min-w-[140px] overflow-hidden animate-scale-in"
                  >
                    {b.status === 'pending' && (
                      <button
                        onClick={() => handleAction(b.id, 'confirm')}
                        className="w-full px-4 py-2.5 text-sm text-left hover:bg-cream-50 flex items-center gap-2 text-brand-700"
                      >
                        <CheckCircle2 className="w-4 h-4" /> 确认预约
                      </button>
                    )}
                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => handleAction(b.id, 'complete')}
                        className="w-full px-4 py-2.5 text-sm text-left hover:bg-cream-50 flex items-center gap-2 text-ink-900"
                      >
                        <CheckCircle2 className="w-4 h-4" /> 标记完成
                      </button>
                    )}
                    {b.status !== 'cancelled' && b.status !== 'completed' && (
                      <button
                        onClick={() => handleAction(b.id, 'cancel')}
                        className="w-full px-4 py-2.5 text-sm text-left hover:bg-red-50 flex items-center gap-2 text-red-600 border-t border-cream-200"
                      >
                        <XCircle className="w-4 h-4" /> 取消预约
                      </button>
                    )}
                    <button
                      onClick={() => setActionMenuFor(null)}
                      className="w-full px-4 py-2 text-xs text-center text-ink-400 hover:bg-cream-50 border-t border-cream-200"
                    >
                      关闭
                    </button>
                  </Card>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 浮动操作提示 */}
      {actionMenuFor && (
        <div
          className="fixed inset-0 z-[5]"
          onClick={() => setActionMenuFor(null)}
        />
      )}
    </div>
  );
}

// 避免未使用 import 警告
void MoreHorizontal;
void Button;
void formatDate;
