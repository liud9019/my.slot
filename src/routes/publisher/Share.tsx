import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Copy, Check, Share2, QrCode, MessageCircle, Link2, ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth';
import { PageHeader } from '../../components/mobile/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from '../../stores/toast';
import { copyText } from '../../lib/utils';

export function Share() {
  const navigate = useNavigate();
  const publisher = useAuthStore(s => s.publisher);
  const [copied, setCopied] = useState(false);

  const link = useMemo(() => {
    if (!publisher) return '';
    const origin = window.location.origin;
    return `${origin}/b/${publisher.slug}`;
  }, [publisher]);

  if (!publisher) {
    return (
      <div className="p-6">
        <p className="text-sm text-ink-500">加载中…</p>
      </div>
    );
  }

  const handleCopy = async () => {
    const ok = await copyText(link);
    if (ok) {
      setCopied(true);
      toast.success('链接已复制到剪贴板');
      setTimeout(() => setCopied(false), 2400);
    } else {
      toast.error('复制失败，请长按链接手动复制');
    }
  };

  const handleOpen = () => {
    window.open(link, '_blank');
  };

  return (
    <div className="min-h-screen bg-aurora">
      <PageHeader title="分享预约链接" backFallback="/publisher" transparent />

      <div className="px-5 pt-4">
        {/* 顶部品牌卡片 */}
        <Card padding="lg" className="text-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-3xl shadow-brand mx-auto mb-3">
            {publisher.avatar || '✨'}
          </div>
          <h2 className="font-serif text-xl font-semibold text-ink-900">{publisher.name}</h2>
          <p className="text-sm text-ink-500 mt-1">{publisher.title}</p>
          <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs">
            <Link2 className="w-3 h-3" />
            my.slot/b/{publisher.slug}
          </div>
        </Card>

        {/* 链接展示 */}
        <Card padding="lg" className="mb-4">
          <label className="block text-xs font-medium text-ink-500 mb-2">你的专属预约链接</label>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-cream-50 border border-cream-200">
            <Link2 className="w-4 h-4 text-brand-500 shrink-0" />
            <span className="flex-1 text-sm text-ink-900 truncate font-mono">{link}</span>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              block
              variant={copied ? 'secondary' : 'primary'}
              onClick={handleCopy}
              icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? '已复制' : '复制链接'}
            </Button>
            <Button variant="secondary" onClick={handleOpen} icon={<ExternalLink className="w-4 h-4" />}>
              预览
            </Button>
          </div>
        </Card>

        {/* 二维码占位 */}
        <Card padding="lg" className="mb-4 text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-2xl bg-cream-50 border border-cream-200 mb-3">
            <QrCode className="w-16 h-16 text-ink-400" />
          </div>
          <p className="text-sm text-ink-900 font-medium">扫码预约</p>
          <p className="text-xs text-ink-500 mt-1">客户用微信扫一扫即可打开</p>
        </Card>

        {/* 微信分享引导 */}
        <Card padding="lg">
          <h3 className="font-serif font-semibold text-ink-900 mb-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-brand-500" />
            微信分享步骤
          </h3>
          <ol className="space-y-3">
            {[
              { t: '复制链接', d: '点击上方「复制链接」按钮' },
              { t: '打开微信', d: '进入想分享的聊天窗口' },
              { t: '粘贴发送', d: '在输入框长按粘贴并发送' },
            ].map((s, i) => (
              <li key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <div className="text-sm font-medium text-ink-900">{s.t}</div>
                  <div className="text-xs text-ink-500 mt-0.5">{s.d}</div>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        {/* 直接打开预约者端 */}
        <button
          onClick={() => navigate(`/b/${publisher.slug}`)}
          className="w-full mt-4 p-4 rounded-2xl bg-white border border-cream-200 shadow-card flex items-center gap-3 press-shrink"
        >
          <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-gold-600" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-ink-900">以预约者身份体验</div>
            <div className="text-xs text-ink-500 mt-0.5">打开你的公开预约页</div>
          </div>
          <ExternalLink className="w-4 h-4 text-ink-400" />
        </button>

        <p className="text-center text-xs text-ink-400 mt-6 px-6 leading-relaxed">
          提示：演示模式下，链接在当前浏览器内有效。<br/>
          真实环境中，任何人在微信内打开此链接均可预约。
        </p>
      </div>
    </div>
  );
}
