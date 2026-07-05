import { useState } from 'react';
import { Plus, Clock, Trash2, Copy, CalendarClock } from 'lucide-react';
import { useAuthStore } from '../../stores/auth';
import { PageHeader } from '../../components/mobile/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from '../../stores/toast';
import {
  getAvailability, saveAvailability, emptyWeekly,
} from '../../lib/storage';
import type { WeeklyAvailability, AvailabilitySlot } from '../../lib/types';
import { WEEKDAY_LABELS, WEEKDAY_SHORT } from '../../lib/types';
import { cn, formatHHMM, parseTime } from '../../lib/utils';

const TIME_OPTIONS = (() => {
  const arr: string[] = [];
  for (let h = 7; h <= 22; h++) {
    arr.push(formatHHMM(h * 60));
    arr.push(formatHHMM(h * 60 + 30));
  }
  return arr;
})();

export function Availability() {
  const session = useAuthStore(s => s.session);
  const userId = session?.userId || '';
  const [avail, setAvail] = useState<WeeklyAvailability>(() => getAvailability(userId));
  const [activeDay, setActiveDay] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(1);
  const [saving, setSaving] = useState(false);

  const update = (next: WeeklyAvailability) => {
    setAvail(next);
  };

  const addSlot = (day: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
    const slots = avail[day];
    const last = slots[slots.length - 1];
    const start = last ? last.end : '09:00';
    const startMin = parseTime(start);
    const end = formatHHMM(Math.min(startMin + 60, 22 * 60));
    update({ ...avail, [day]: [...slots, { start, end }] });
  };

  const updateSlot = (day: 0 | 1 | 2 | 3 | 4 | 5 | 6, idx: number, key: keyof AvailabilitySlot, value: string) => {
    const slots = [...avail[day]];
    slots[idx] = { ...slots[idx], [key]: value };
    // 自动修正：end 必须 > start
    if (key === 'start' && parseTime(value) >= parseTime(slots[idx].end)) {
      slots[idx].end = formatHHMM(Math.min(parseTime(value) + 60, 22 * 60));
    }
    if (key === 'end' && parseTime(value) <= parseTime(slots[idx].start)) {
      slots[idx].start = formatHHMM(Math.max(parseTime(value) - 60, 7 * 60));
    }
    update({ ...avail, [day]: slots });
  };

  const removeSlot = (day: 0 | 1 | 2 | 3 | 4 | 5 | 6, idx: number) => {
    const slots = avail[day].filter((_, i) => i !== idx);
    update({ ...avail, [day]: slots });
  };

  const copyToAll = (day: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
    const src = avail[day];
    if (src.length === 0) {
      toast.error('当前日没有时段可复制');
      return;
    }
    const next: WeeklyAvailability = { ...avail };
    for (const d of [1, 2, 3, 4, 5, 6, 0] as const) {
      if (d !== day) next[d] = src.map(s => ({ ...s }));
    }
    update(next);
    toast.success(`已复制到其他日期`);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    saveAvailability(userId, avail);
    setSaving(false);
    toast.success('可用时间已保存');
  };

  const clearDay = (day: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
    update({ ...avail, [day]: [] });
  };

  const totalSlots = (Object.values(avail) as AvailabilitySlot[][]).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="min-h-screen bg-cream-50 pb-24">
      <PageHeader
        title="可用时间"
        subtitle={`共 ${totalSlots} 个时段 · 周循环`}
        backFallback="/publisher"
      />

      {/* 周历条 */}
      <div className="px-5 pt-4 pb-2 bg-cream-50 sticky top-14 z-20">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {[1, 2, 3, 4, 5, 6, 0].map(d => {
            const day = d as 0 | 1 | 2 | 3 | 4 | 5 | 6;
            const slots = avail[day];
            const active = day === activeDay;
            return (
              <button
                key={d}
                onClick={() => setActiveDay(day)}
                className={cn(
                  'shrink-0 w-12 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all press-shrink border',
                  active
                    ? 'bg-brand-500 text-white border-brand-500 shadow-brand'
                    : 'bg-white text-ink-900 border-cream-200',
                )}
              >
                <span className={cn('text-xs', active ? 'text-white/80' : 'text-ink-400')}>
                  {WEEKDAY_SHORT[day]}
                </span>
                <span className={cn('text-xs font-medium tabular-nums', active ? 'text-white' : 'text-ink-900')}>
                  {slots.length === 0 ? '休息' : `${slots.length}段`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 pt-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-serif font-semibold text-ink-900 text-lg">{WEEKDAY_LABELS[activeDay]}</h2>
            <p className="text-xs text-ink-500 mt-0.5">
              {avail[activeDay].length === 0 ? '当日未设置可用时段' : `${avail[activeDay].length} 个时段`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToAll(activeDay)}
              icon={<Copy className="w-3.5 h-3.5" />}
            >
              复制到全周
            </Button>
            {avail[activeDay].length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => clearDay(activeDay)}
                icon={<Trash2 className="w-3.5 h-3.5" />}
              >
                清空
              </Button>
            )}
          </div>
        </div>

        {avail[activeDay].length === 0 ? (
          <Card padding="lg">
            <div className="text-center py-8">
              <CalendarClock className="w-10 h-10 mx-auto text-ink-400 mb-3" />
              <p className="text-sm text-ink-500 mb-4">当日没有可预约时段</p>
              <Button size="sm" onClick={() => addSlot(activeDay)} icon={<Plus className="w-4 h-4" />}>
                添加时段
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {avail[activeDay].map((slot, idx) => (
              <Card key={idx} padding="md" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-brand-500" />
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <select
                    value={slot.start}
                    onChange={e => updateSlot(activeDay, idx, 'start', e.target.value)}
                    className="flex-1 h-10 px-2 rounded-lg bg-cream-50 border border-cream-200 text-sm tabular-nums text-ink-900 font-medium"
                  >
                    {TIME_OPTIONS.filter(t => parseTime(t) < parseTime(slot.end)).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <span className="text-ink-400 text-xs">至</span>
                  <select
                    value={slot.end}
                    onChange={e => updateSlot(activeDay, idx, 'end', e.target.value)}
                    className="flex-1 h-10 px-2 rounded-lg bg-cream-50 border border-cream-200 text-sm tabular-nums text-ink-900 font-medium"
                  >
                    {TIME_OPTIONS.filter(t => parseTime(t) > parseTime(slot.start)).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => removeSlot(activeDay, idx)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="删除时段"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Card>
            ))}
            <button
              onClick={() => addSlot(activeDay)}
              className="w-full h-12 rounded-xl border-2 border-dashed border-cream-300 text-sm text-ink-500 hover:border-brand-300 hover:text-brand-600 transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              添加时段
            </button>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-lg border-t border-cream-200 px-5 py-3 safe-bottom" style={{ maxWidth: 480, margin: '0 auto', left: 0, right: 0 }}>
        <Button block loading={saving} onClick={handleSave}>
          保存可用时间
        </Button>
      </div>
    </div>
  );
}

// 避免未使用 import 警告
void emptyWeekly;
