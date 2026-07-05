import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronRight, Sparkles, User, Link2, CalendarClock } from 'lucide-react';
import { useAuthStore } from '../../stores/auth';
import { PageHeader } from '../../components/mobile/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { toast } from '../../stores/toast';
import {
  savePublisher, getPublisherByUserId,
} from '../../lib/storage';
import type { PublisherProfile } from '../../lib/types';
import { genId } from '../../lib/utils';
import { resetAll } from '../../lib/storage';
import { seedDemoData } from '../../lib/seed';

const AVATAR_OPTIONS = ['🌿', '✨', '🎯', '📚', '💼', '🎨', '☕', '🔮', '🌟', '🎓'];

export function Profile() {
  const navigate = useNavigate();
  const session = useAuthStore(s => s.session);
  const publisher = useAuthStore(s => s.publisher);
  const refreshPublisher = useAuthStore(s => s.refreshPublisher);
  const logout = useAuthStore(s => s.logout);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<PublisherProfile | null>(publisher);
  const [saving, setSaving] = useState(false);

  if (!session || !publisher || !form) {
    return <div className="p-6"><p className="text-sm text-ink-500">加载中…</p></div>;
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('请填写姓名');
      return;
    }
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    savePublisher(form);
    refreshPublisher();
    setSaving(false);
    setEditing(false);
    toast.success('资料已更新');
  };

  const handleLogout = () => {
    logout();
    toast.success('已退出登录');
    navigate('/login', { replace: true });
  };

  const handleReset = () => {
    if (!window.confirm('确定要重置所有演示数据吗？这会清空所有预约、事件与资料。')) return;
    resetAll();
    seedDemoData(true);
    refreshPublisher();
    setForm(getPublisherByUserId(session.userId));
    toast.success('演示数据已重置');
    navigate('/publisher', { replace: true });
  };

  if (editing) {
    return (
      <div className="min-h-screen bg-cream-50 pb-24">
        <PageHeader
          title="编辑资料"
          backFallback="/publisher/profile"
          right={
            <Button size="sm" loading={saving} onClick={handleSave}>
              保存
            </Button>
          }
        />
        <div className="p-5 space-y-4">
          <Card padding="lg">
            <label className="block text-sm font-medium text-ink-900 mb-2">头像</label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map(a => (
                <button
                  key={a}
                  onClick={() => setForm({ ...form, avatar: a })}
                  className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all press-shrink border-2 ${
                    form.avatar === a ? 'border-brand-500 bg-brand-50 scale-110' : 'border-cream-200 bg-white'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </Card>
          <Card padding="lg" className="space-y-4">
            <Input
              label="姓名"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              maxLength={20}
            />
            <Input
              label="职业标签"
              placeholder="例如：职业规划咨询师"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              maxLength={30}
            />
            <Textarea
              label="个人简介"
              placeholder="向客户介绍你的专业背景与服务价值"
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              maxLength={200}
              hint={`${form.bio.length}/200`}
            />
            <Input
              label="预约链接短码"
              value={form.slug}
              onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
              hint={`链接：my.slot/b/${form.slug}`}
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <PageHeader title="我的" backFallback="/publisher" />

      {/* 资料卡片 */}
      <div className="px-5 pt-4">
        <Card padding="lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-3xl shadow-brand">
              {publisher.avatar || '✨'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-serif text-xl font-semibold text-ink-900 truncate">{publisher.name}</h2>
              <p className="text-sm text-ink-500 mt-0.5 truncate">{publisher.title}</p>
              <p className="text-xs text-brand-600 mt-1 font-mono truncate">my.slot/b/{publisher.slug}</p>
            </div>
          </div>
          {publisher.bio && (
            <p className="mt-4 text-sm text-ink-700 leading-relaxed bg-cream-50 rounded-xl p-3">
              {publisher.bio}
            </p>
          )}
          <Button block variant="secondary" className="mt-4" onClick={() => setEditing(true)}>
            编辑资料
          </Button>
        </Card>
      </div>

      {/* 菜单 */}
      <div className="px-5 mt-4 space-y-2">
        <Card padding="none">
          <MenuItem icon={<Link2 className="w-4 h-4" />} label="我的预约链接" onClick={() => navigate('/publisher/share')} />
          <MenuItem icon={<CalendarClock className="w-4 h-4" />} label="可用时间设置" onClick={() => navigate('/publisher/availability')} />
          <MenuItem icon={<User className="w-4 h-4" />} label="事件类型管理" onClick={() => navigate('/publisher/events')} />
        </Card>

        <Card padding="none">
          <MenuItem
            icon={<Sparkles className="w-4 h-4" />}
            label="重置演示数据"
            onClick={handleReset}
            danger
          />
        </Card>

        <Card padding="none">
          <MenuItem
            icon={<LogOut className="w-4 h-4" />}
            label="退出登录"
            onClick={handleLogout}
            danger
          />
        </Card>
      </div>

      <div className="px-5 mt-8 text-center">
        <p className="text-xs text-ink-400">
          my.slot · v0.1.0 MVP
        </p>
        <p className="text-[10px] text-ink-400 mt-1">
          {session.phone} · 登录时间 {new Date(session.loginAt).toLocaleString('zh-CN')}
        </p>
      </div>
    </div>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

function MenuItem({ icon, label, onClick, danger }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 h-14 flex items-center gap-3 hover:bg-cream-50 transition-colors press-shrink border-b border-cream-200 last:border-b-0 ${
        danger ? 'text-red-600' : 'text-ink-900'
      }`}
    >
      <span className={danger ? 'text-red-500' : 'text-brand-500'}>{icon}</span>
      <span className="flex-1 text-left text-sm font-medium">{label}</span>
      <ChevronRight className="w-4 h-4 text-ink-400" />
    </button>
  );
}

// 避免未使用 import 警告
void genId;
