import { NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid, CalendarClock, CalendarDays, CalendarRange, User } from 'lucide-react';
import { cn } from '../../lib/utils';

const items = [
  { to: '/publisher', label: '工作台', icon: LayoutGrid, end: true },
  { to: '/publisher/events', label: '事件', icon: CalendarClock, end: false },
  { to: '/publisher/bookings', label: '预约', icon: CalendarDays, end: false },
  { to: '/publisher/profile', label: '我的', icon: User, end: false },
];

export function TabBar() {
  const location = useLocation();
  return (
    <nav className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-lg border-t border-cream-200 safe-bottom">
      <div className="h-16 flex items-stretch">
        {items.map(item => {
          const active = item.end
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
            >
              {active && (
                <span className="absolute top-0 w-8 h-0.5 bg-brand-500 rounded-full" />
              )}
              <Icon
                className={cn(
                  'w-5 h-5 transition-colors',
                  active ? 'text-brand-500' : 'text-ink-400',
                )}
                strokeWidth={active ? 2.2 : 1.5}
              />
              <span
                className={cn(
                  'text-[10px] transition-colors',
                  active ? 'text-brand-600 font-medium' : 'text-ink-400',
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

// 兼容旧引用
export { TabBar as PublisherTabBar };
// 避免未使用 import 报错
void CalendarRange;
