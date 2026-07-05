import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, Calendar as CalendarIcon, Info } from 'lucide-react';
import { PageHeader } from '../../components/mobile/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DayStrip } from '../../components/booking/DayStrip';
import { SlotGrid } from '../../components/booking/SlotGrid';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  getPublisherBySlug, getEvent, getAvailableSlots, getAvailability,
} from '../../lib/storage';
import { formatDuration, formatHHMM, nextDays, parseTime } from '../../lib/utils';
import { getWeekday } from '../../lib/utils';

const DAY_COUNT = 14;

export function SelectSlots() {
  const { slug, eventId } = useParams();
  const navigate = useNavigate();

  const { publisher, event } = useMemo(() => {
    if (!slug || !eventId) return { publisher: null, event: null };
    const pub = getPublisherBySlug(slug);
    if (!pub) return { publisher: null, event: null };
    const evt = getEvent(eventId);
    if (!evt || evt.publisherId !== pub.userId || !evt.active) return { publisher: null, event: null };
    return { publisher: pub, event: evt };
  }, [slug, eventId]);

  const days = useMemo(() => nextDays(DAY_COUNT), []);
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  // 当事件变化时，重置选择
  useEffect(() => {
    setSelectedSlots([]);
  }, [eventId, selectedDay]);

  if (!publisher || !event) {
    return (
      <div className="min-h-screen bg-cream-50">
        <PageHeader title="未找到" backFallback="/login" />
        <EmptyState
          icon={<CalendarIcon className="w-8 h-8" />}
          title="事件不存在"
          description="该事件可能已被下架"
        />
      </div>
    );
  }

  // 当日可选时段
  const slots = useMemo(() => {
    if (!publisher || !event) return [];
    return getAvailableSlots(publisher.userId, selectedDay, event.durationMin, event.id);
  }, [publisher, event, selectedDay]);

  // 14 天每日可用数
  const availabilityMap = useMemo(() => {
    if (!publisher || !event) return {};
    const map: Record<string, number> = {};
    for (const d of days) {
      const s = getAvailableSlots(publisher.userId, d, event.durationMin, event.id);
      map[d] = s.filter(x => x.available).length;
    }
    return map;
  }, [publisher, event, days]);

  const toggleSlot = (time: string) => {
    setSelectedSlots(prev =>
      prev.includes(time)
        ? prev.filter(t => t !== time)
        : [...prev, time].sort((a, b) => parseTime(a) - parseTime(b))
    );
  };

  const handleNext = () => {
    if (selectedSlots.length === 0) return;
    navigate(`/b/${slug}/${eventId}/confirm`, {
      state: { date: selectedDay, slots: selectedSlots },
    });
  };

  // 简介信息
  const totalMin = selectedSlots.length * event.durationMin;
  const wd = getWeekday(selectedDay);

  return (
    <div className="min-h-screen bg-cream-50 pb-28">
      <PageHeader
        title={event.name}
        subtitle={`${formatDuration(event.durationMin)} · 共 ${selectedSlots.length} 个时段`}
        backFallback={`/b/${slug}`}
      />

      {/* 事件信息卡 */}
      <div className="px-5 pt-4">
        <Card padding="md" className="flex items-center gap-3">
          <div
            className="w-1.5 h-12 rounded-full shrink-0"
            style={{ backgroundColor: event.color }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-ink-500">单次时长 {formatDuration(event.durationMin)}</p>
            <p className="text-xs text-ink-400 mt-0.5">
              提前 {event.leadTimeMin < 60 ? `${event.leadTimeMin} 分钟` : event.leadTimeMin === 1440 ? '1 天' : `${event.leadTimeMin / 60} 小时`} 可约
              {event.dailyCap > 0 && ` · 每日上限 ${event.dailyCap}`}
            </p>
          </div>
          <Clock className="w-5 h-5 text-ink-400 shrink-0" />
        </Card>
      </div>

      {/* 日期选择 */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif font-semibold text-ink-900">选择日期</h2>
          <span className="text-xs text-ink-400">未来 {DAY_COUNT} 天</span>
        </div>
        <DayStrip
          days={days}
          value={selectedDay}
          onChange={setSelectedDay}
          availabilityMap={availabilityMap}
        />
      </div>

      {/* 时段选择 */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif font-semibold text-ink-900">可选时段</h2>
          <span className="text-xs text-ink-400">
            {slots.filter(s => s.available).length} 个可约
          </span>
        </div>

        {slots.length === 0 ? (
          <Card padding="lg">
            <EmptyState
              icon={<CalendarIcon className="w-8 h-8" />}
              title="当日休息"
              description="该日期没有开放可预约时段，请选择其他日期"
            />
          </Card>
        ) : (
          <SlotGrid
            slots={slots}
            selected={selectedSlots}
            onToggle={toggleSlot}
          />
        )}

        {/* 多选提示 */}
        <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-brand-50 border border-brand-100">
          <Info className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
          <p className="text-xs text-brand-700 leading-relaxed">
            支持多选时段，每个时段为 {formatDuration(event.durationMin)}。
            {selectedSlots.length > 0 && (
              <span className="block mt-1 font-medium">
                已选 {selectedSlots.length} 个 · 合计 {formatDuration(totalMin)}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 底部 CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-lg border-t border-cream-200 px-5 py-3 safe-bottom" style={{ maxWidth: 480, margin: '0 auto', left: 0, right: 0 }}>
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            {selectedSlots.length > 0 ? (
              <>
                <p className="text-xs text-ink-500">已选 {selectedSlots.length} 个时段</p>
                <p className="text-sm font-medium text-ink-900 truncate">
                  <span className="tabular-nums">{selectedSlots[0]}</span>
                  {selectedSlots.length > 1 && (
                    <span className="text-ink-400"> 至 {formatHHMM(parseTime(selectedSlots[selectedSlots.length - 1]) + event.durationMin)}</span>
                  )}
                </p>
              </>
            ) : (
              <p className="text-sm text-ink-400">请至少选择一个时段</p>
            )}
          </div>
          <Button
            disabled={selectedSlots.length === 0}
            onClick={handleNext}
          >
            下一步
          </Button>
        </div>
      </div>
    </div>
  );
}
