import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarClock, CalendarDays, Share2, Plus, Clock,
  TrendingUp, CalendarHeart, ChevronRight, Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { BookingCard } from '../../components/booking/BookingCard';
import {
  listBookingsByPublisher, listEvents, getPublisherByUserId,
} from '../../lib/storage';
import { friendlyDate, formatDate, timeAgo } from '../../lib/utils';

export function Dashboard() {
  const navigate = useNavigate();
  const session = useAuthStore(s => s.session);
  const publisher = useAuthStore(s => s.publisher);
  const userId = session?.userId || '';

  const data = useMemo(() => {
    if (!userId) return null;
    const pub = getPublisherByUserId(userId);
    const bookings = listBookingsByPublisher(userId);
    const events = listEvents(userId);
    const today = formatDate(new Date());
    const todayBookings = bookings.filter(b => b.date === today && b.status !== 'cancelled');
    const pending = bookings.filter(b => b.status === 'pending');
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const weekBookings = bookings.filter(b => {
      const t = new Date(b.date).getTime();
      return t >= startOfWeek.getTime() && b.status !== 'cancelled';
    });
    const completed = bookings.filter(b => b.status === 'completed');
    return { pub, bookings, events, todayBookings, pending, weekBookings, completed };
  }, [userId]);

  if (!data || !publisher) {
    return (
      <div className="p-6">
        <p className="text-sm text-ink-500">加载中…</p>
      </div>
    );
  }

  const stats = [
    { label: '今日预约', value: data.todayBookings.length, icon: CalendarDays, color: '#6B4FBB' },
    { label: '待处理', value: data.pending.length, icon: Clock, color: '#C9A961' },
    { label: '本周预约', value: data.weekBookings.length, icon: TrendingUp, color: '#3E2C6E' },
    { label: '已完成', value: data.completed.length, icon: Sparkles, color: '#2D4A3E' },
  ];

  const shortcuts = [
    { label: '创建事件', desc: '新增可预约服务', icon: Plus, to: '/publisher/events/new', color: '#6B4FBB' },
    { label: '查看预约', desc: '管理收到的预约', icon: CalendarDays, to: '/publisher/bookings', color: '#C9A961' },
    { label: '分享链接', desc: '把链接发给客户', icon: Share2, to: '/publisher/share', color: '#3E2C6E' },
    { label: '设置时间', desc: '配置周循环可用', icon: CalendarClock, to: '/publisher/availability', color: '#2D4A3E' },
  ];

  const recent = data.bookings.slice(0, 3);

  return (
    <div className="bg-aurora min-h-screen">
      {/* 顶部品牌区 */}
      <div className="px-5 pt-12 pb-6 safe-top">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-500 mb-1">你好，</p>
            <h1 className="font-serif text-2xl font-bold text-ink-900">
              {publisher.name}
            </h1>
            <p className="text-xs text-ink-500 mt-1">{publisher.title}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-2xl shadow-brand">
            {publisher.avatar || '✨'}
          </div>
        </div>
      </div>

      {/* 数据卡片 */}
      <div className="px-5 mb-4">
        <div className="grid grid-cols-4 gap-2">
          {stats.map(s => {
            const Icon = s.icon;
            return (
              <Card key={s.label} padding="sm" className="text-center">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5"
                  style={{ backgroundColor: `${s.color}1A`, color: s.color }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-bold tabular-nums text-ink-900 font-serif">
                  {s.value}
                </div>
                <div className="text-[10px] text-ink-500">{s.label}</div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="px-5 mb-4">
        <Card padding="none">
          <div className="grid grid-cols-2 divide-x divide-y divide-cream-200">
            {shortcuts.map((s, i) => {
              const Icon = s.icon;
              const isRight = i % 2 === 1;
              const isBottom = i >= 2;
              return (
                <button
                  key={s.label}
                  onClick={() => navigate(s.to)}
                  className={`p-4 text-left hover:bg-cream-50 transition-colors press-shrink
                    ${isRight ? '' : ''} ${isBottom ? '' : ''}`}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
                    style={{ backgroundColor: `${s.color}1A`, color: s.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-medium text-ink-900">{s.label}</div>
                  <div className="text-xs text-ink-400 mt-0.5">{s.desc}</div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* 分享横幅 */}
      <div className="px-5 mb-4">
        <button
          onClick={() => navigate('/publisher/share')}
          className="w-full bg-gradient-to-r from-brand-500 to-brand-700 rounded-2xl p-4 text-left press-shrink shadow-brand flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm">分享你的预约链接</p>
            <p className="text-white/80 text-xs mt-0.5 truncate">
              my.slot/b/{publisher.slug}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/80 shrink-0" />
        </button>
      </div>

      {/* 最近预约 */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif font-semibold text-ink-900">最近预约</h2>
          {recent.length > 0 && (
            <button
              onClick={() => navigate('/publisher/bookings')}
              className="text-xs text-brand-600 font-medium flex items-center"
            >
              查看全部 <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
        {recent.length === 0 ? (
          <Card padding="lg" className="text-center">
            <EmptyState
              icon={<CalendarHeart className="w-8 h-8" />}
              title="还没有预约"
              description="分享你的链接给客户，开始接收预约吧"
              action={
                <Button size="sm" onClick={() => navigate('/publisher/share')}>
                  去分享链接
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {recent.map(b => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </div>

      <p className="text-center text-[10px] text-ink-400 pb-4">
        my.slot · 最近活跃 {timeAgo(session?.loginAt || Date.now())}
      </p>
    </div>
  );
}

// 避免未使用 import 警告
void friendlyDate;
