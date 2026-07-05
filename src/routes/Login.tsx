import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ShieldCheck, ArrowRight, CalendarHeart } from 'lucide-react';
import { MobileFrame } from '../components/mobile/MobileFrame';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from '../stores/toast';
import { useAuthStore } from '../stores/auth';
import { createUser, getUserByPhone, getPublisherByUserId, savePublisher, generateSlug } from '../lib/storage';
import { isValidPhone, generateCode } from '../lib/utils';
import { DEMO_PHONE } from '../lib/seed';

export function Login() {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async () => {
    setError('');
    if (!isValidPhone(phone)) {
      setError('请输入正确的手机号');
      return;
    }
    setSending(true);
    // 模拟发送
    await new Promise(r => setTimeout(r, 600));
    const c = generateCode();
    setSentCode(c);
    setSending(false);
    setStep('code');
    if (phone === DEMO_PHONE) {
      toast.info('演示账号：验证码为 888888');
    } else {
      toast.info(`演示模式：验证码为 ${c}`);
    }
  };

  const handleLogin = async () => {
    setError('');
    if (code.length !== 6) {
      setError('请输入 6 位验证码');
      return;
    }
    if (code !== sentCode) {
      setError('验证码不正确');
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));

    // 创建/获取用户
    let user = getUserByPhone(phone);
    if (!user) user = createUser(phone);

    // 如果还没有发布者资料，自动创建一份默认的
    let pub = getPublisherByUserId(user.id);
    if (!pub) {
      pub = {
        userId: user.id,
        slug: generateSlug(phone.slice(-4)),
        name: `用户${phone.slice(-4)}`,
        title: '专业服务者',
        avatar: '✨',
        bio: '欢迎使用 my.slot，请到「我的」页面完善资料。',
        createdAt: Date.now(),
      };
      savePublisher(pub);
    }

    login({
      userId: user.id,
      phone: user.phone,
      role: 'publisher',
      loginAt: Date.now(),
    });
    setSubmitting(false);
    toast.success('登录成功');
    navigate('/publisher', { replace: true });
  };

  return (
    <MobileFrame>
      <div className="min-h-screen flex flex-col bg-aurora">
        {/* 顶部品牌区 */}
        <div className="px-8 pt-20 pb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-brand-500 shadow-brand mb-5 animate-scale-in">
            <CalendarHeart className="w-8 h-8 text-white" strokeWidth={1.8} />
          </div>
          <h1 className="font-serif text-4xl font-bold text-gradient-brand tracking-tight">
            my.slot
          </h1>
          <p className="mt-2 text-sm text-ink-500 font-serif">
            把时间，留给对的人
          </p>
        </div>

        {/* 表单卡片 */}
        <div className="flex-1 px-6 pb-10">
          <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-6 animate-slide-up">
            {step === 'phone' ? (
              <>
                <div className="mb-5">
                  <h2 className="text-xl font-serif font-semibold text-ink-900">手机号登录</h2>
                  <p className="text-sm text-ink-500 mt-1">发布者入口，管理你的预约</p>
                </div>
                <Input
                  label="手机号"
                  placeholder="请输入 11 位手机号"
                  inputMode="numeric"
                  maxLength={11}
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  error={error}
                  suffix={<Phone className="w-4 h-4 text-ink-400 mr-3" />}
                />
                <Button
                  block
                  className="mt-5"
                  loading={sending}
                  onClick={handleSendCode}
                  icon={!sending && <ArrowRight className="w-4 h-4" />}
                >
                  {sending ? '发送中…' : '获取验证码'}
                </Button>
              </>
            ) : (
              <>
                <div className="mb-5">
                  <h2 className="text-xl font-serif font-semibold text-ink-900">输入验证码</h2>
                  <p className="text-sm text-ink-500 mt-1">
                    验证码已发送至 <span className="tabular-nums text-ink-900">{phone}</span>
                  </p>
                </div>
                <Input
                  label="验证码"
                  placeholder="6 位数字"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  error={error}
                  suffix={<ShieldCheck className="w-4 h-4 text-ink-400 mr-3" />}
                />
                <Button block className="mt-5" loading={submitting} onClick={handleLogin}>
                  登录 / 注册
                </Button>
                <button
                  onClick={() => { setStep('phone'); setCode(''); setError(''); }}
                  className="mt-4 w-full text-center text-sm text-ink-500 hover:text-brand-600 transition-colors"
                >
                  返回修改手机号
                </button>
              </>
            )}
          </div>

          {/* 预约者入口 */}
          <div className="mt-6 text-center text-sm text-ink-500">
            <p>我是预约者</p>
            <button
              onClick={() => navigate('/b/demo')}
              className="mt-2 text-brand-600 font-medium hover:text-brand-700 transition-colors"
            >
              打开演示预约链接 →
            </button>
            <span className="mx-2 text-ink-400">·</span>
            <button
              onClick={() => navigate('/my/bookings')}
              className="text-brand-600 font-medium hover:text-brand-700 transition-colors"
            >
              查看我的预约
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-ink-400 px-6 leading-relaxed">
            登录即代表同意《用户协议》与《隐私政策》<br/>
            演示账号：13800000001 · 验证码 888888
          </p>
        </div>
      </div>
    </MobileFrame>
  );
}
