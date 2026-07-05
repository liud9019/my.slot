import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, ChevronRight, CalendarHeart, User } from 'lucide-react';
import { PageHeader } from '../../components/mobile/PageHeader';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { EventCard } from '../../components/booking/EventCard';
import {
  getPublisherBySlug, listEvents,
} from '../../lib/storage';
import { formatDuration } from '../../lib/utils';

export function PublicPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { publisher, events } = useMemo(() => {
    if (!slug) return { publisher: null, events: [] };
    const pub = getPublisherBySlug(slug);
    if (!pub) return { publisher: null, events: [] };
    const evts = listEvents(pub.userId).filter(e => e.active);
    return { publisher: pub, events: evts };
  }, [slug]);

  if (!publisher) {
    return (
      <div className="min-h-screen bg-cream-50">
        <PageHeader title="未找到" backFallback="/login" />
        <EmptyState
          icon={<User className="w-8 h-8" />}
          title="链接已失效"
          description="该预约链接不存在或已停用，请联系发布者确认"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aurora">
      <PageHeader title="预约" backFallback="/login" />

      {/* 发布者介绍区 */}
      <div className="px-5 pt-6 pb-8 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-4xl shadow-brand mx-auto mb-4">
          {publisher.avatar || '✨'}
        </div>
        <h1 className="font-serif text-2xl font-bold text-ink-900">{publisher.name}</h1>
        <p className="text-sm text-brand-600 mt-1 font-medium">{publisher.title}</p>
        {publisher.bio && (
          <p className="mt-3 text-sm text-ink-500 leading-relaxed max-w-[320px] mx-auto">
            {publisher.bio}
          </p>
        )}
        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm border border-cream-200 text-xs text-ink-500">
          <CalendarHeart className="w-3 h-3 text-brand-500" />
          欢迎预约 my.slot
        </div>
      </div>

      {/* 事件列表 */}
      <div className="px-5 pb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif font-semibold text-ink-900">选择服务</h2>
          <span className="text-xs text-ink-400">{events.length} 个可预约</span>
        </div>

        {events.length === 0 ? (
          <Card padding="lg">
            <EmptyState
              icon={<Clock className="w-8 h-8" />}
              title="暂无可预约事件"
              description="发布者还未开放预约，请稍后再来"
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {events.map(e => (
              <EventCard
                key={e.id}
                event={e}
                clickable
                to={`/b/${slug}/${e.id}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 底部入口 */}
      <div className="px-5 pb-8 pt-2 border-t border-cream-200">
        <button
          onClick={() => navigate('/my/bookings')}
          className="w-full flex items-center justify-between p-3 text-sm text-ink-500 hover:text-brand-600 transition-colors"
        >
          <span>查看我的预约</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-center text-[10px] text-ink-400 pb-4">
        Powered by my.slot · 专业的预约工具
      </p>
    </div>
  );
}

// 避免未使用 import 警告
void formatDuration;
