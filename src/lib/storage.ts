import {
  User, PublisherProfile, EventType, Booking, Session,
  WeeklyAvailability, AvailabilitySlot,
  SlotTakenError, ValidationError,
} from './types';
import { genId, parseTime, formatHHMM, getWeekday } from './utils';

const KEYS = {
  USERS: 'myslot:users',
  PUBLISHERS: 'myslot:publishers',
  AVAILABILITY: 'myslot:availability',
  EVENTS: 'myslot:events',
  BOOKINGS: 'myslot:bookings',
  SESSION: 'myslot:session',
  SEEDED: 'myslot:seeded',
} as const;

// ===== 基础读写 =====

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ===== 用户 =====

export function getUserByPhone(phone: string): User | null {
  const users = read<User[]>(KEYS.USERS, []);
  return users.find(u => u.phone === phone) || null;
}

export function createUser(phone: string): User {
  const users = read<User[]>(KEYS.USERS, []);
  const existing = users.find(u => u.phone === phone);
  if (existing) return existing;
  const user: User = { id: genId('u'), phone, createdAt: Date.now() };
  users.push(user);
  write(KEYS.USERS, users);
  return user;
}

// ===== 会话 =====

export function getSession(): Session | null {
  return read<Session | null>(KEYS.SESSION, null);
}

export function setSession(s: Session | null): void {
  if (s === null) localStorage.removeItem(KEYS.SESSION);
  else write(KEYS.SESSION, s);
}

export function clearSession(): void {
  localStorage.removeItem(KEYS.SESSION);
}

// ===== 发布者资料 =====

export function getPublisherBySlug(slug: string): PublisherProfile | null {
  const list = read<PublisherProfile[]>(KEYS.PUBLISHERS, []);
  return list.find(p => p.slug === slug) || null;
}

export function getPublisherByUserId(userId: string): PublisherProfile | null {
  const list = read<PublisherProfile[]>(KEYS.PUBLISHERS, []);
  return list.find(p => p.userId === userId) || null;
}

export function savePublisher(profile: PublisherProfile): void {
  const list = read<PublisherProfile[]>(KEYS.PUBLISHERS, []);
  const idx = list.findIndex(p => p.userId === profile.userId);
  if (idx >= 0) list[idx] = profile;
  else list.push(profile);
  write(KEYS.PUBLISHERS, list);
}

export function generateSlug(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'user';
  const list = read<PublisherProfile[]>(KEYS.PUBLISHERS, []);
  let slug = base;
  let n = 1;
  while (list.some(p => p.slug === slug)) {
    slug = `${base}${n++}`;
  }
  return slug;
}

// ===== 可用时间 =====

export function getAvailability(userId: string): WeeklyAvailability {
  const all = read<Record<string, WeeklyAvailability>>(KEYS.AVAILABILITY, {});
  return all[userId] || emptyWeekly();
}

export function saveAvailability(userId: string, avail: WeeklyAvailability): void {
  const all = read<Record<string, WeeklyAvailability>>(KEYS.AVAILABILITY, {});
  all[userId] = avail;
  write(KEYS.AVAILABILITY, all);
}

export function emptyWeekly(): WeeklyAvailability {
  return { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
}

// ===== 事件类型 =====

export function listEvents(publisherId: string): EventType[] {
  const all = read<EventType[]>(KEYS.EVENTS, []);
  return all.filter(e => e.publisherId === publisherId).sort((a, b) => a.createdAt - b.createdAt);
}

export function getEvent(id: string): EventType | null {
  const all = read<EventType[]>(KEYS.EVENTS, []);
  return all.find(e => e.id === id) || null;
}

export function saveEvent(event: EventType): void {
  const all = read<EventType[]>(KEYS.EVENTS, []);
  const idx = all.findIndex(e => e.id === event.id);
  if (idx >= 0) all[idx] = event;
  else all.push(event);
  write(KEYS.EVENTS, all);
}

export function deleteEvent(id: string): void {
  const all = read<EventType[]>(KEYS.EVENTS, []);
  write(KEYS.EVENTS, all.filter(e => e.id !== id));
}

// ===== 预约 =====

export function listBookingsByPublisher(publisherId: string): Booking[] {
  const all = read<Booking[]>(KEYS.BOOKINGS, []);
  return all
    .filter(b => b.publisherId === publisherId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function listBookingsByPhone(phone: string): Booking[] {
  const all = read<Booking[]>(KEYS.BOOKINGS, []);
  return all
    .filter(b => b.clientPhone === phone)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getBooking(id: string): Booking | null {
  const all = read<Booking[]>(KEYS.BOOKINGS, []);
  return all.find(b => b.id === id) || null;
}

export function updateBookingStatus(id: string, status: Booking['status']): void {
  const all = read<Booking[]>(KEYS.BOOKINGS, []);
  const idx = all.findIndex(b => b.id === id);
  if (idx >= 0) {
    all[idx].status = status;
    write(KEYS.BOOKINGS, all);
  }
}

/** 收集某日已被占用（未取消）的时段集合 */
export function getBookedSlots(publisherId: string, date: string): Set<string> {
  const all = read<Booking[]>(KEYS.BOOKINGS, []);
  const booked = new Set<string>();
  for (const b of all) {
    if (b.publisherId !== publisherId) continue;
    if (b.date !== date) continue;
    if (b.status === 'cancelled') continue;
    for (const s of b.slots) booked.add(s);
  }
  return booked;
}

/** 根据周循环可用时间 + 事件时长，生成某日的可选时段列表 */
export function generateSlots(avail: AvailabilitySlot[], durationMin: number): string[] {
  const slots: string[] = [];
  for (const slot of avail) {
    const cur = parseTime(slot.start);
    const end = parseTime(slot.end);
    let t = cur;
    while (t + durationMin <= end) {
      slots.push(formatHHMM(t));
      t += durationMin;
    }
  }
  return slots;
}

/** 获取某发布者某日某事件时长的可用时段（剔除已占用） */
export function getAvailableSlots(
  publisherId: string,
  date: string,
  durationMin: number,
  eventId: string,
): { time: string; available: boolean }[] {
  const wd = getWeekday(date);
  const avail = getAvailability(publisherId)[wd] || [];
  const allSlots = generateSlots(avail, durationMin);
  const booked = getBookedSlots(publisherId, date);
  // 同一事件同一日，同手机号未取消的预约也视为占用（防止重复）
  return allSlots.map(time => {
    // 该时段是否已被任何 active 预约占用
    const isBooked = booked.has(time);
    return { time, available: !isBooked };
  });
}

/** 创建预约（含预占锁双重检查） */
export function createBooking(input: {
  publisherId: string;
  eventId: string;
  clientName: string;
  clientPhone: string;
  note?: string;
  date: string;
  slots: string[];
}): Booking {
  if (!input.slots.length) throw new ValidationError('请至少选择一个时段');
  if (!input.clientName.trim()) throw new ValidationError('请填写姓名');
  if (!input.clientPhone.trim()) throw new ValidationError('请填写手机号');

  const event = getEvent(input.eventId);
  if (!event) throw new ValidationError('事件类型不存在');
  if (!event.active) throw new ValidationError('该事件已停用');

  const publisher = getPublisherByUserId(input.publisherId);
  if (!publisher) throw new ValidationError('发布者不存在');

  // 双重检查 1：再次校验时段可用
  const availability = getAvailableSlots(input.publisherId, input.date, event.durationMin, input.eventId);
  const availableMap = new Map(availability.map(a => [a.time, a.available]));
  const conflicting = input.slots.filter(s => !availableMap.get(s));
  if (conflicting.length > 0) {
    throw new SlotTakenError(conflicting);
  }

  // 检查 2：同手机号同日是否已预约同一事件（防重复提交）
  const existing = listBookingsByPhone(input.clientPhone);
  const dup = existing.find(b =>
    b.eventId === input.eventId &&
    b.date === input.date &&
    b.status !== 'cancelled' &&
    b.slots.some(s => input.slots.includes(s))
  );
  if (dup) {
    throw new SlotTakenError(input.slots);
  }

  // 检查 3：提前预约时间
  if (event.leadTimeMin > 0) {
    const [y, m, d] = input.date.split('-').map(Number);
    const [sh, sm] = input.slots[0].split(':').map(Number);
    const slotTime = new Date(y, m - 1, d, sh, sm).getTime();
    const needBefore = slotTime - event.leadTimeMin * 60000;
    if (Date.now() > needBefore) {
      throw new ValidationError('已超过提前预约时间，请选择其他时段');
    }
  }

  // 写入（localStorage 同步写入，天然避免并发）
  const booking: Booking = {
    id: genId('bk'),
    publisherId: input.publisherId,
    eventId: input.eventId,
    eventSnapshot: {
      name: event.name,
      durationMin: event.durationMin,
      format: event.format,
      color: event.color,
    },
    publisherSnapshot: {
      name: publisher.name,
      title: publisher.title,
    },
    clientName: input.clientName.trim(),
    clientPhone: input.clientPhone.trim(),
    note: input.note?.trim() || undefined,
    date: input.date,
    slots: [...input.slots].sort(),
    status: event.confirmMode === 'auto' ? 'confirmed' : 'pending',
    createdAt: Date.now(),
    lockExpireAt: Date.now() + 10 * 60 * 1000, // 预留 10 分钟（未来后端方案）
  };

  const all = read<Booking[]>(KEYS.BOOKINGS, []);
  all.push(booking);
  write(KEYS.BOOKINGS, all);
  return booking;
}

// ===== 数据重置（调试用） =====

export function resetAll(): void {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}

export function isSeeded(): boolean {
  return read<boolean>(KEYS.SEEDED, false);
}

export function markSeeded(): void {
  write(KEYS.SEEDED, true);
}
