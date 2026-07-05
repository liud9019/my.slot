import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarHeart, Search, Phone, CalendarCheck } from 'lucide-react';
import { PageHeader } from '../../components/mobile/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { EmptyState } from '../../components/ui/EmptyState';
import { BookingCard } from '../../components/booking/BookingCard';
import { toast } from '../../stores/toast';
import {
  listBookingsByPhone, updateBookingStatus,
} from '../../lib/storage';
import { isValidPhone, formatDate, parseDate, friendlyDate } from '../../lib/utils';

type Filter = 'upcoming' | 'completed' | 'cancelled';

const PHONE_KEY = 'myslot:myphone';

export function MyBookings() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState(() => localStorage.getItem(PHONE_KEY) || '');
  const [searchedPhone, setSearchedPhone] = useState(() => localStorage.getItem(PHONE_KEY) || '');
  const [filter, setFilter] = useState<Filter>('upcoming');
  const [tick, setTick] = useState(0);

  const bookings = useMemo(() => {
    if (!searchedPhone) return [];
    return listBookingsByPhone(searchedPhone);
  }, [searchedPhone, tick]);

  const handleSearch = () => {
    if (!isValidPhone(phone)) {
      toast.error('请输入正确的手机号');
      return;
    }
    localStorage.setItem(PHONE_KEY, phone);
    setSearchedPhone(phone);
    toast.success('已查询预约');
  };

  const today = formatDate(new Date());

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      if (filter === 'upcoming') {
        return b.status === 'confirmed' || b.status === 'pending';
      }
      if (filter === 'completed') return b.status === 'completed';
      if (filter === 'cancelled') return b.status === 'cancelled';
      return true;
    }).sort((a, b) => {
      // 即将到来按时间升序，其他按创建时间倒序
      if (filter === 'upcoming') {
        return a.date.localeCompare(b.date) || a.slots[0].localeCompare(b.slots[0]);
      }
      return b.createdAt - a.createdAt;
    });
  }, [bookings, filter, today]);

  const counts = useMemo(() => ({
    upcoming: bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  }), [bookings]);

  const handleCancel = (id: string) => {
    if (!window.confirm('确定取消此预约吗？')) return;
    updateBookingStatus(id, 'cancelled');
    toast.success('预约已取消');
    setTick(t => t + 1);
  };

  // 未查询状态
  if (!searchedPhone) {
    return (
      <div className="min-h-screen bg-aurora">
        <PageHeader title="我的预约" backFallback="/login" />
        <div className="px-5 pt-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-50 mb-3">
              <CalendarHeart className="w-8 h-8 text-brand-500" />
            </div>
            <h2 className="font-serif text-xl font-bold text-ink-900">查看我的预约</h2>
            <p className="text-sm text-ink-500 mt-1">输入预约时填写的手机号即可查询</p>
          </div>

          <Card padding="lg" className="space-y-4">
            <Input
              label="手机号"
              placeholder="请输入 11 位手机号"
              inputMode="numeric"
              maxLength={11}
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              suffix={<Phone className="w-4 h-4 text-ink-400 mr-3" />}
            />
            <Button block onClick={handleSearch} disabled={phone.length !== 11}>
              查询预约
            </Button>
          </Card>

          <p className="text-center text-xs text-ink-400 mt-6 leading-relaxed">
            演示账号可输入 13900000001 ~ 13900000005<br/>
            查看种子预约数据
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <PageHeader
        title="我的预约"
        subtitle={`手机号 ${searchedPhone}`}
        backFallback="/login"
        right={
          <button
            onClick={() => { localStorage.removeItem(PHONE_KEY); setPhone(''); setSearchedPhone(''); }}
            className="text-xs text-brand-600 font-medium"
          >
            切换号
          </button>
        }
      />

      <div className="px-5 pt-4 pb-2 sticky top-14 z-20 bg-cream-50">
        <Tabs<Filter>
          value={filter}
          onChange={setFilter}
          tabs={[
            { key: 'upcoming', label: '即将到来', count: counts.upcoming },
            { key: 'completed', label: '已完成', count: counts.completed },
            { key: 'cancelled', label: '已取消', count: counts.cancelled },
          ]}
        />
      </div>

      <div className="p-5 pt-3">
        {filtered.length === 0 ? (
          <Card padding="lg">
            <EmptyState
              icon={<CalendarCheck className="w-8 h-8" />}
              title={filter === 'upcoming' ? '暂无即将到来的预约' : filter === 'completed' ? '还没有完成的预约' : '没有取消的预约'}
              description={
                filter === 'upcoming'
                  ? '去发布者的预约页选一个时段吧'
                  : '历史预约会显示在这里'
              }
              action={
                filter === 'upcoming' && (
                  <Button size="sm" onClick={() => navigate('/b/demo')}>
                    去预约
                  </Button>
                )
              }
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(b => (
              <div key={b.id} className="space-y-2">
                {/* 日期分组标签 */}
                {filter === 'upcoming' && (
                  <div className="text-xs font-medium text-ink-500 px-1">
                    {friendlyDate(b.date)}
                  </div>
                )}
                <BookingCard
                  booking={b}
                  asBooker
                />
                {/* 取消按钮 */}
                {(b.status === 'confirmed' || b.status === 'pending') && (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancel(b.id)}
                      className="text-red-500 hover:bg-red-50"
                    >
                      取消预约
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 pb-6 pt-2">
        <button
          onClick={() => navigate('/b/demo')}
          className="w-full flex items-center justify-between p-3 text-sm text-ink-500 hover:text-brand-600 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Search className="w-4 h-4" />
            发起新预约
          </span>
          →
        </button>
      </div>
    </div>
  );
}

// 避免未使用 import 警告
void parseDate;
