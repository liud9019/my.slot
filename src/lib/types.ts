// my.slot 核心类型定义

export interface User {
  id: string;
  phone: string;
  createdAt: number;
}

export interface PublisherProfile {
  userId: string;
  slug: string;              // 预约链接短码
  name: string;
  title: string;             // 职业标签
  avatar?: string;           // 头像 emoji 或 url
  bio: string;
  createdAt: number;
}

// 周循环可用时间：0=周日, 1=周一, ..., 6=周六
export interface AvailabilitySlot {
  start: string;  // "09:00"
  end: string;    // "10:30"
}
export type WeeklyAvailability = Record<0 | 1 | 2 | 3 | 4 | 5 | 6, AvailabilitySlot[]>;

export type EventFormat = 'offline' | 'video' | 'phone';
export type ConfirmMode = 'auto' | 'manual';

export interface EventType {
  id: string;
  publisherId: string;
  name: string;
  durationMin: number;
  format: EventFormat;
  description: string;
  color: string;             // 卡片色条 hex
  confirmMode: ConfirmMode;
  leadTimeMin: number;       // 提前预约时间（分钟）
  dailyCap: number;          // 每日上限，0 表示不限
  active: boolean;
  createdAt: number;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  publisherId: string;
  eventId: string;
  eventSnapshot: {
    name: string;
    durationMin: number;
    format: EventFormat;
    color: string;
  };
  publisherSnapshot: {
    name: string;
    title: string;
  };
  clientName: string;
  clientPhone: string;
  note?: string;
  date: string;              // "2026-07-05"
  slots: string[];           // ["09:00", "09:30"]
  status: BookingStatus;
  createdAt: number;
  lockExpireAt?: number;
}

export interface Session {
  userId: string;
  phone: string;
  role: 'publisher';
  loginAt: number;
}

// 错误类型
export class SlotTakenError extends Error {
  constructor(public conflictingSlots: string[]) {
    super('部分时段已被预约');
    this.name = 'SlotTakenError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// 事件颜色预设
export const EVENT_COLORS = [
  '#6B4FBB', // MBTI 紫
  '#3E2C6E', // 靛紫深
  '#C9A961', // 柔金
  '#B5523A', // 陶土红
  '#2D4A3E', // 墨绿
  '#4A6FA5', // 静蓝
  '#A8588C', // 玫瑰紫
  '#7B6FA8', // 烟紫
] as const;

export const FORMAT_LABELS: Record<EventFormat, string> = {
  offline: '线下见面',
  video: '线上视频',
  phone: '电话沟通',
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: '待确认',
  confirmed: '已确认',
  completed: '已完成',
  cancelled: '已取消',
};

export const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: '#C9A961',
  confirmed: '#6B4FBB',
  completed: '#3E2C6E',
  cancelled: '#8B82A3',
};

export const WEEKDAY_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'] as const;
export const WEEKDAY_SHORT = ['日', '一', '二', '三', '四', '五', '六'] as const;
