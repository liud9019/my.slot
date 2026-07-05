import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ===== 时间工具 =====

/** 生成唯一 ID */
export function genId(prefix = ''): string {
  const s = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return prefix ? `${prefix}_${s}` : s;
}

/** "HH:MM" -> 当日分钟数 */
export function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/** 分钟数 -> "HH:MM" */
export function formatHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** 时长分钟 -> 中文标签 */
export function formatDuration(min: number): string {
  if (min < 60) return `${min} 分钟`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (m === 0) return h === 1 ? '1 小时' : `${h} 小时`;
  return `${h} 小时 ${m} 分`;
}

/** 日期 -> "YYYY-MM-DD" 本地时区 */
export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** "YYYY-MM-DD" -> Date 本地 */
export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** 获取某日的周几索引 (0-6, 0=周日) */
export function getWeekday(s: string): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  return parseDate(s).getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

/** 友好日期 "今天" / "明天" / "周X" / "M月D日" */
export function friendlyDate(s: string): string {
  const target = parseDate(s);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  const wd = target.getDay();
  const wdLabel = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][wd];
  if (diff === 0) return `今天 · ${wdLabel}`;
  if (diff === 1) return `明天 · ${wdLabel}`;
  if (diff === 2) return `后天 · ${wdLabel}`;
  return `${target.getMonth() + 1}月${target.getDate()}日 · ${wdLabel}`;
}

/** 短日期 "M/D" */
export function shortDate(s: string): string {
  const d = parseDate(s);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** 完整日期时间 "M月D日 HH:MM" 或 "M月D日 HH:MM 起（共N个时段）" */
export function fullDateTime(date: string, slots: string[]): string {
  const d = parseDate(date);
  const head = `${d.getMonth() + 1}月${d.getDate()}日`;
  if (slots.length === 0) return head;
  if (slots.length === 1) return `${head} ${slots[0]}`;
  return `${head} ${slots[0]} 起（共${slots.length}个时段）`;
}

/** 给 "HH:MM" 加分钟，返回新 "HH:MM" */
export function addMinutesToTime(t: string, min: number): string {
  return formatHHMM(parseTime(t) + min);
}

/** 手机号校验 */
export function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

/** 复制文本到剪贴板，降级方案 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // 降级
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

/** 模拟验证码（MVP） */
export function generateCode(): string {
  return '888888';
}

/** 时间相对当前多久之前 */
export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return '刚刚';
  if (min < 60) return `${min} 分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小时前`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} 天前`;
  const d = new Date(ts);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

/** 生成未来 N 天的日期列表 */
export function nextDays(count: number, from = new Date()): string[] {
  const days: string[] = [];
  const base = new Date(from);
  base.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    days.push(formatDate(d));
  }
  return days;
}
