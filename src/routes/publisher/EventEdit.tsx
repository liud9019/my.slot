import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2, Save, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/auth';
import { PageHeader } from '../../components/mobile/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { toast } from '../../stores/toast';
import {
  getEvent, saveEvent, deleteEvent, listEvents,
} from '../../lib/storage';
import {
  EVENT_COLORS, FORMAT_LABELS, type EventFormat, type EventType,
} from '../../lib/types';
import { cn, formatDuration, genId } from '../../lib/utils';

const DURATIONS = [15, 30, 45, 60, 90, 120];
const LEAD_TIMES = [
  { value: 0, label: '不限制' },
  { value: 15, label: '提前 15 分钟' },
  { value: 30, label: '提前 30 分钟' },
  { value: 60, label: '提前 1 小时' },
  { value: 120, label: '提前 2 小时' },
  { value: 1440, label: '提前 1 天' },
];

export function EventEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const session = useAuthStore(s => s.session);
  const publisherId = session?.userId || '';
  const isEdit = !!id;

  const [event, setEvent] = useState<EventType>(() => {
    if (id) {
      const existing = getEvent(id);
      if (existing) return existing;
    }
    return {
      id: genId('evt'),
      publisherId,
      name: '',
      durationMin: 60,
      format: 'video',
      description: '',
      color: EVENT_COLORS[0],
      confirmMode: 'auto',
      leadTimeMin: 30,
      dailyCap: 0,
      active: true,
      createdAt: Date.now(),
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const update = <K extends keyof EventType>(key: K, value: EventType[K]) => {
    setEvent(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!event.name.trim()) e.name = '请填写事件名称';
    if (!event.description.trim()) e.description = '请填写事件描述';
    if (event.durationMin < 5) e.durationMin = '时长至少 5 分钟';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error('请完善表单信息');
      return;
    }
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    saveEvent({ ...event, name: event.name.trim(), description: event.description.trim() });
    setSaving(false);
    toast.success(isEdit ? '已保存修改' : '事件已创建');
    navigate('/publisher/events', { replace: true });
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    deleteEvent(event.id);
    toast.success('事件已删除');
    navigate('/publisher/events', { replace: true });
  };

  return (
    <div className="min-h-screen bg-cream-50 pb-24">
      <PageHeader
        title={isEdit ? '编辑事件' : '新建事件'}
        backFallback="/publisher/events"
        right={
          <Button size="sm" loading={saving} onClick={handleSave} icon={!saving && <Save className="w-4 h-4" />}>
            保存
          </Button>
        }
      />

      <div className="p-5 space-y-5">
        {/* 基础信息 */}
        <Card padding="lg" className="space-y-4">
          <h3 className="text-sm font-semibold text-ink-900 font-serif">基础信息</h3>
          <Input
            label="事件名称"
            placeholder="例如：职业方向咨询"
            value={event.name}
            onChange={e => update('name', e.target.value)}
            error={errors.name}
            maxLength={30}
          />
          <Textarea
            label="事件描述"
            placeholder="向客户说明这个事件的内容、流程与价值"
            value={event.description}
            onChange={e => update('description', e.target.value)}
            error={errors.description}
            maxLength={200}
            hint={`${event.description.length}/200`}
          />

          {/* 时长选择器 */}
          <div>
            <label className="block text-sm font-medium text-ink-900 mb-2">单次时长</label>
            <div className="grid grid-cols-3 gap-2">
              {DURATIONS.map(d => (
                <button
                  key={d}
                  onClick={() => update('durationMin', d)}
                  className={cn(
                    'h-10 rounded-xl text-sm font-medium transition-all press-shrink border',
                    event.durationMin === d
                      ? 'bg-brand-500 text-white border-brand-500 shadow-brand'
                      : 'bg-white text-ink-900 border-cream-200 hover:border-brand-300',
                  )}
                >
                  {formatDuration(d)}
                </button>
              ))}
            </div>
            {errors.durationMin && <p className="text-xs text-red-500 mt-1">{errors.durationMin}</p>}
          </div>

          {/* 形式选择器 */}
          <div>
            <label className="block text-sm font-medium text-ink-900 mb-2">沟通形式</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(FORMAT_LABELS) as EventFormat[]).map(f => (
                <button
                  key={f}
                  onClick={() => update('format', f)}
                  className={cn(
                    'h-10 rounded-xl text-sm font-medium transition-all press-shrink border',
                    event.format === f
                      ? 'bg-brand-500 text-white border-brand-500 shadow-brand'
                      : 'bg-white text-ink-900 border-cream-200 hover:border-brand-300',
                  )}
                >
                  {FORMAT_LABELS[f]}
                </button>
              ))}
            </div>
          </div>

          {/* 颜色选择器 */}
          <div>
            <label className="block text-sm font-medium text-ink-900 mb-2">卡片颜色</label>
            <div className="flex flex-wrap gap-2">
              {EVENT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => update('color', c)}
                  className={cn(
                    'w-9 h-9 rounded-xl transition-all press-shrink',
                    event.color === c ? 'ring-2 ring-offset-2 ring-brand-400 scale-110' : '',
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`选择颜色 ${c}`}
                />
              ))}
            </div>
          </div>
        </Card>

        {/* 高级设置 */}
        <Card padding="lg" className="space-y-4">
          <h3 className="text-sm font-semibold text-ink-900 font-serif">预约规则</h3>

          {/* 确认方式 */}
          <div>
            <label className="block text-sm font-medium text-ink-900 mb-2">确认方式</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => update('confirmMode', 'auto')}
                className={cn(
                  'h-12 rounded-xl text-sm font-medium transition-all press-shrink border px-3 text-left',
                  event.confirmMode === 'auto'
                    ? 'bg-brand-50 text-brand-700 border-brand-300'
                    : 'bg-white text-ink-900 border-cream-200',
                )}
              >
                <div className="font-medium">自动确认</div>
                <div className="text-[10px] text-ink-500 mt-0.5">提交即生效</div>
              </button>
              <button
                onClick={() => update('confirmMode', 'manual')}
                disabled
                className={cn(
                  'h-12 rounded-xl text-sm font-medium transition-all border px-3 text-left opacity-50 cursor-not-allowed',
                  'bg-white text-ink-900 border-cream-200',
                )}
              >
                <div className="font-medium">人工审核</div>
                <div className="text-[10px] text-ink-500 mt-0.5">MVP 后置</div>
              </button>
            </div>
          </div>

          {/* 提前预约时间 */}
          <div>
            <label className="block text-sm font-medium text-ink-900 mb-2">提前预约时间</label>
            <div className="flex flex-wrap gap-2">
              {LEAD_TIMES.map(t => (
                <button
                  key={t.value}
                  onClick={() => update('leadTimeMin', t.value)}
                  className={cn(
                    'h-9 px-3 rounded-full text-xs font-medium transition-all press-shrink border',
                    event.leadTimeMin === t.value
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-ink-900 border-cream-200',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 每日上限 */}
          <Input
            label="每日预约上限"
            type="number"
            min={0}
            value={event.dailyCap || ''}
            placeholder="0 表示不限制"
            onChange={e => update('dailyCap', Math.max(0, Number(e.target.value) || 0))}
            hint="限制同一日内该事件的最大预约数"
          />

          {/* 启停 */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="text-sm font-medium text-ink-900">事件生效中</div>
              <div className="text-xs text-ink-500 mt-0.5">停用后客户将看不到此事件</div>
            </div>
            <button
              onClick={() => update('active', !event.active)}
              className={cn(
                'relative w-12 h-7 rounded-full transition-colors',
                event.active ? 'bg-brand-500' : 'bg-cream-300',
              )}
              role="switch"
              aria-checked={event.active}
            >
              <span
                className={cn(
                  'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all',
                  event.active ? 'left-[22px]' : 'left-0.5',
                )}
              />
            </button>
          </div>
        </Card>

        {/* 删除 */}
        {isEdit && (
          <Card padding="lg">
            <button
              onClick={handleDelete}
              className={cn(
                'w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-medium transition-colors',
                confirmDelete
                  ? 'bg-red-500 text-white'
                  : 'bg-red-50 text-red-600 hover:bg-red-100',
              )}
            >
              {confirmDelete ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  再次点击确认删除
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  删除此事件
                </>
              )}
            </button>
          </Card>
        )}
      </div>

      {/* 底部固定 CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-lg border-t border-cream-200 px-5 py-3 safe-bottom" style={{ maxWidth: 480, margin: '0 auto', left: 0, right: 0 }}>
        <Button block loading={saving} onClick={handleSave}>
          {isEdit ? '保存修改' : '创建事件'}
        </Button>
      </div>
    </div>
  );
}

// 避免未使用 import 警告
void listEvents;
