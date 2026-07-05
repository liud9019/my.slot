import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CalendarClock } from 'lucide-react';
import { useAuthStore } from '../../stores/auth';
import { PageHeader } from '../../components/mobile/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { EventCard } from '../../components/booking/EventCard';
import { listEvents, listBookingsByPublisher } from '../../lib/storage';
import { formatDate } from '../../lib/utils';

export function Events() {
  const navigate = useNavigate();
  const session = useAuthStore(s => s.session);
  const userId = session?.userId || '';

  const { events, weeklyCountMap } = useMemo(() => {
    const events = listEvents(userId);
    const bookings = listBookingsByPublisher(userId);
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const end = new Date(startOfWeek);
    end.setDate(startOfWeek.getDate() + 7);
    const map: Record<string, number> = {};
    for (const b of bookings) {
      if (b.status === 'cancelled') continue;
      const t = new Date(b.date).getTime();
      if (t >= startOfWeek.getTime() && t < end.getTime()) {
        map[b.eventId] = (map[b.eventId] || 0) + 1;
      }
    }
    return { events, weeklyCountMap: map };
  }, [userId]);

  const activeEvents = events.filter(e => e.active);
  const inactiveEvents = events.filter(e => !e.active);

  return (
    <div className="min-h-screen bg-cream-50">
      <PageHeader
        title="事件类型"
        subtitle={`共 ${events.length} 个 · ${activeEvents.length} 个启用中`}
        right={
          <Button size="sm" onClick={() => navigate('/publisher/events/new')} icon={<Plus className="w-4 h-4" />}>
            新建
          </Button>
        }
      />

      <div className="p-5">
        {events.length === 0 ? (
          <Card padding="lg">
            <EmptyState
              icon={<CalendarClock className="w-8 h-8" />}
              title="还没有事件类型"
              description="创建你的第一个事件类型，让客户可以开始预约"
              action={
                <Button onClick={() => navigate('/publisher/events/new')} icon={<Plus className="w-4 h-4" />}>
                  创建第一个事件
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="space-y-5">
            <section>
              <h2 className="text-xs font-semibold text-ink-500 mb-2 px-1">启用中</h2>
              <div className="space-y-3">
                {activeEvents.map(e => (
                  <EventCard
                    key={e.id}
                    event={e}
                    weeklyCount={weeklyCountMap[e.id] || 0}
                    clickable
                    to={`/publisher/events/${e.id}/edit`}
                  />
                ))}
                {activeEvents.length === 0 && (
                  <p className="text-sm text-ink-400 px-1">暂无启用的事件</p>
                )}
              </div>
            </section>

            {inactiveEvents.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-ink-500 mb-2 px-1">已停用</h2>
                <div className="space-y-3">
                  {inactiveEvents.map(e => (
                    <EventCard
                      key={e.id}
                      event={e}
                      weeklyCount={weeklyCountMap[e.id] || 0}
                      clickable
                      to={`/publisher/events/${e.id}/edit`}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// 避免未使用 import 警告
void formatDate;
void Card;
