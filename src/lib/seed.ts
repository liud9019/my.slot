import {
  createUser, savePublisher, saveAvailability, saveEvent,
  markSeeded, isSeeded, getUserByPhone,
} from './storage';
import type { WeeklyAvailability, EventType, PublisherProfile } from './types';
import { genId, formatDate } from './utils';

export const DEMO_PHONE = '13800000001';
export const DEMO_SLUG = 'demo';

/** 初始化演示数据 */
export function seedDemoData(force = false): void {
  if (!force && isSeeded()) return;

  // 创建演示用户
  let demoUser = getUserByPhone(DEMO_PHONE);
  if (!demoUser) {
    demoUser = createUser(DEMO_PHONE);
  }

  // 发布者资料
  const publisher: PublisherProfile = {
    userId: demoUser.id,
    slug: DEMO_SLUG,
    name: '林知夏',
    title: '职业规划咨询师',
    avatar: '🌿',
    bio: '前互联网大厂 HR 负责人，专注职业转型与领导力发展，已陪伴 200+ 客户完成关键决策。',
    createdAt: Date.now() - 30 * 86400000,
  };
  savePublisher(publisher);

  // 周循环可用时间
  const avail: WeeklyAvailability = {
    0: [],                                    // 周日休息
    1: [{ start: '09:30', end: '12:00' }, { start: '14:00', end: '18:00' }],
    2: [{ start: '10:00', end: '12:30' }, { start: '14:30', end: '17:30' }],
    3: [{ start: '09:30', end: '12:00' }, { start: '14:00', end: '18:00' }],
    4: [{ start: '10:00', end: '12:30' }],
    5: [{ start: '09:30', end: '12:00' }, { start: '14:00', end: '16:30' }],
    6: [{ start: '10:00', end: '12:00' }],
  };
  saveAvailability(demoUser.id, avail);

  // 事件类型
  const events: EventType[] = [
    {
      id: genId('evt'),
      publisherId: demoUser.id,
      name: '职业方向咨询',
      durationMin: 60,
      format: 'video',
      description: '一对一深度沟通，梳理当前困惑，明确未来 3 个月的行动方向。适合正在考虑转型或换工作的伙伴。',
      color: '#6B4FBB',
      confirmMode: 'auto',
      leadTimeMin: 60,
      dailyCap: 0,
      active: true,
      createdAt: Date.now() - 25 * 86400000,
    },
    {
      id: genId('evt'),
      publisherId: demoUser.id,
      name: '简历精修辅导',
      durationMin: 45,
      format: 'video',
      description: '逐句打磨简历内容，突出核心竞争力，让你的简历在 30 秒内打动面试官。',
      color: '#C9A961',
      confirmMode: 'auto',
      leadTimeMin: 30,
      dailyCap: 4,
      active: true,
      createdAt: Date.now() - 20 * 86400000,
    },
    {
      id: genId('evt'),
      publisherId: demoUser.id,
      name: '模拟面试',
      durationMin: 90,
      format: 'video',
      description: '还原真实面试场景，覆盖行为面试 + 案例分析，结束后提供详细复盘报告。',
      color: '#B5523A',
      confirmMode: 'auto',
      leadTimeMin: 120,
      dailyCap: 2,
      active: true,
      createdAt: Date.now() - 15 * 86400000,
    },
    {
      id: genId('evt'),
      publisherId: demoUser.id,
      name: '15 分钟快速咨询',
      durationMin: 15,
      format: 'phone',
      description: '适合单一问题快速答疑，例如 offer 选择、面试准备建议等。',
      color: '#2D4A3E',
      confirmMode: 'auto',
      leadTimeMin: 15,
      dailyCap: 0,
      active: false,
      createdAt: Date.now() - 10 * 86400000,
    },
  ];
  for (const e of events) saveEvent(e);

  // 历史预约（演示用）
  const today = new Date();
  const todayStr = formatDate(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(today.getDate() + 2);

  // 直接写入 bookings（不走 createBooking，避免占用检查）
  const sampleBookings = [
    {
      id: genId('bk'),
      publisherId: demoUser.id,
      eventId: events[0].id,
      eventSnapshot: { name: events[0].name, durationMin: events[0].durationMin, format: events[0].format, color: events[0].color },
      publisherSnapshot: { name: publisher.name, title: publisher.title },
      clientName: '李明',
      clientPhone: '13900000001',
      note: '想聊聊从产品转岗到运营的可能性',
      date: todayStr,
      slots: ['10:00'],
      status: 'confirmed' as const,
      createdAt: Date.now() - 2 * 3600000,
    },
    {
      id: genId('bk'),
      publisherId: demoUser.id,
      eventId: events[1].id,
      eventSnapshot: { name: events[1].name, durationMin: events[1].durationMin, format: events[1].format, color: events[1].color },
      publisherSnapshot: { name: publisher.name, title: publisher.title },
      clientName: '王雪',
      clientPhone: '13900000002',
      note: '5 年前端经验，目标大厂',
      date: todayStr,
      slots: ['15:00'],
      status: 'completed' as const,
      createdAt: Date.now() - 5 * 3600000,
    },
    {
      id: genId('bk'),
      publisherId: demoUser.id,
      eventId: events[2].id,
      eventSnapshot: { name: events[2].name, durationMin: events[2].durationMin, format: events[2].format, color: events[2].color },
      publisherSnapshot: { name: publisher.name, title: publisher.title },
      clientName: '陈飞',
      clientPhone: '13900000003',
      note: '准备下周的产品经理面试',
      date: formatDate(tomorrow),
      slots: ['14:30'],
      status: 'confirmed' as const,
      createdAt: Date.now() - 8 * 3600000,
    },
    {
      id: genId('bk'),
      publisherId: demoUser.id,
      eventId: events[0].id,
      eventSnapshot: { name: events[0].name, durationMin: events[0].durationMin, format: events[0].format, color: events[0].color },
      publisherSnapshot: { name: publisher.name, title: publisher.title },
      clientName: '周婷',
      clientPhone: '13900000004',
      note: '',
      date: formatDate(dayAfter),
      slots: ['10:00', '11:00'],
      status: 'confirmed' as const,
      createdAt: Date.now() - 1 * 3600000,
    },
    {
      id: genId('bk'),
      publisherId: demoUser.id,
      eventId: events[1].id,
      eventSnapshot: { name: events[1].name, durationMin: events[1].durationMin, format: events[1].format, color: events[1].color },
      publisherSnapshot: { name: publisher.name, title: publisher.title },
      clientName: '孙宇',
      clientPhone: '13900000005',
      note: '临时取消，改约下周',
      date: formatDate(yesterday),
      slots: ['16:00'],
      status: 'cancelled' as const,
      createdAt: Date.now() - 26 * 3600000,
    },
  ];
  localStorage.setItem('myslot:bookings', JSON.stringify(sampleBookings));

  markSeeded();
}
