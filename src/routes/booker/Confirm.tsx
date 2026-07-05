import { useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Lock, User, Phone, MessageSquare, Clock, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../../components/mobile/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { toast } from '../../stores/toast';
import {
  getPublisherBySlug, getEvent, createBooking,
} from '../../lib/storage';
import {
  SlotTakenError, ValidationError, FORMAT_LABELS,
} from '../../lib/types';
import {
  formatDuration, friendlyDate, parseTime, formatHHMM, isValidPhone,
} from '../../lib/utils';

interface LocationState {
  date: string;
  slots: string[];
}

export function Confirm() {
  const { slug, eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const { publisher, event } = useMemo(() => {
    if (!slug || !eventId) return { publisher: null, event: null };
    const pub = getPublisherBySlug(slug);
    if (!pub) return { publisher: null, event: null };
    const evt = getEvent(eventId);
    if (!evt || evt.publisherId !== pub.userId || !evt.active) return { publisher: null, event: null };
    return { publisher: pub, event: evt };
  }, [slug, eventId]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!publisher || !event || !state) {
    return (
      <div className="min-h-screen bg-cream-50">
        <PageHeader title="出错了" backFallback="/login" />
        <div className="p-6 text-center text-sm text-ink-500">
          预约信息缺失，请重新选择时段
        </div>
        <div className="px-5">
          <Button block onClick={() => navigate(slug ? `/b/${slug}` : '/login')}>
            返回事件列表
          </Button>
        </div>
      </div>
    );
  }

  const totalMin = state.slots.length * event.durationMin;

  const handleSubmit = async () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = '请填写姓名';
    if (!phone.trim()) e.phone = '请填写手机号';
    else if (!isValidPhone(phone)) e.phone = '手机号格式不正确';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));  // 模拟预占锁延迟

    try {
      const booking = createBooking({
        publisherId: publisher.userId,
        eventId: event.id,
        clientName: name,
        clientPhone: phone,
        note,
        date: state.date,
        slots: state.slots,
      });
      toast.success('预约成功');
      navigate(`/b/${slug}/${eventId}/success`, {
        replace: true,
        state: { bookingId: booking.id },
      });
    } catch (err) {
      if (err instanceof SlotTakenError) {
        toast.error(`以下时段已被预约：${err.conflictingSlots.join('、')}`);
        // 返回选时段页
        setTimeout(() => navigate(-1), 1200);
      } else if (err instanceof ValidationError) {
        toast.error(err.message);
      } else {
        toast.error('提交失败，请重试');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 pb-28">
      <PageHeader title="确认预约" backFallback={`/b/${slug}/${eventId}`} />

      <div className="p-5 space-y-4">
        {/* 预约摘要 */}
        <Card padding="lg">
          <div className="flex items-start gap-3">
            <div
              className="w-1.5 self-stretch rounded-full shrink-0"
              style={{ backgroundColor: event.color }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-serif font-semibold text-ink-900 text-lg">{event.name}</h3>
              <p className="text-sm text-ink-500 mt-0.5">{publisher.name} · {publisher.title}</p>

              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-ink-700">
                  <Clock className="w-4 h-4 text-ink-400" />
                  <span className="tabular-nums">{friendlyDate(state.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-ink-700">
                  <span className="w-4 text-ink-400 text-center">·</span>
                  <span className="tabular-nums">
                    {state.slots[0]}
                    {state.slots.length > 1 && (
                      <span className="text-ink-400"> 起（共 {state.slots.length} 个）</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-ink-700">
                  <span className="w-4 text-ink-400 text-center">·</span>
                  <span>合计 {formatDuration(totalMin)} · {FORMAT_LABELS[event.format]}</span>
                </div>
              </div>

              {/* 已选时段列表 */}
              {state.slots.length > 1 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {state.slots.map(s => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-xs tabular-nums font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* 表单 */}
        <Card padding="lg" className="space-y-4">
          <h3 className="font-serif font-semibold text-ink-900">联系信息</h3>

          <Input
            label="姓名"
            placeholder="请填写你的姓名"
            value={name}
            onChange={e => setName(e.target.value)}
            error={errors.name}
            maxLength={20}
            suffix={<User className="w-4 h-4 text-ink-400 mr-3" />}
          />

          <Input
            label="手机号"
            placeholder="11 位手机号"
            inputMode="numeric"
            maxLength={11}
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
            error={errors.phone}
            suffix={<Phone className="w-4 h-4 text-ink-400 mr-3" />}
          />

          <Textarea
            label="备注（选填）"
            placeholder="想提前说明的内容，例如背景、问题等"
            value={note}
            onChange={e => setNote(e.target.value)}
            maxLength={200}
            hint={`${note.length}/200`}
          />
        </Card>

        {/* 预占锁说明 */}
        <Card padding="md" className="bg-brand-50 border-brand-100">
          <div className="flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
            <div className="text-xs text-brand-700 leading-relaxed">
              <p className="font-medium">预占锁保护</p>
              <p className="mt-0.5">提交时系统会再次校验时段可用性，若已被他人预约将提示并返回选择。</p>
            </div>
          </div>
        </Card>

        {/* 隐私承诺 */}
        <div className="flex items-center gap-2 text-xs text-ink-400 px-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>你的信息仅用于本次预约，不会用于其他用途</span>
        </div>
      </div>

      {/* 底部 CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-lg border-t border-cream-200 px-5 py-3 safe-bottom" style={{ maxWidth: 480, margin: '0 auto', left: 0, right: 0 }}>
        <Button block loading={submitting} onClick={handleSubmit}>
          {submitting ? '提交中…' : '提交预约'}
        </Button>
      </div>
    </div>
  );
}

// 避免未使用 import 警告
void parseTime;
void formatHHMM;
