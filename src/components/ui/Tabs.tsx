import { cn } from '../../lib/utils';

interface Tab<T extends string> {
  key: T;
  label: string;
  count?: number;
}

interface TabsProps<T extends string> {
  tabs: Tab<T>[];
  value: T;
  onChange: (v: T) => void;
  variant?: 'underline' | 'pill';
  className?: string;
}

export function Tabs<T extends string>({ tabs, value, onChange, variant = 'underline', className }: TabsProps<T>) {
  if (variant === 'pill') {
    return (
      <div className={cn('flex gap-2 overflow-x-auto no-scrollbar', className)}>
        {tabs.map(t => {
          const active = t.key === value;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={cn(
                'shrink-0 h-9 px-4 rounded-full text-sm font-medium transition-all press-shrink',
                active
                  ? 'bg-brand-500 text-white shadow-brand'
                  : 'bg-white text-ink-500 border border-cream-200',
              )}
            >
              {t.label}
              {typeof t.count === 'number' && (
                <span className={cn('ml-1.5 text-xs', active ? 'opacity-80' : 'text-ink-400')}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex border-b border-cream-200', className)}>
      {tabs.map(t => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={cn(
              'relative flex-1 h-11 text-sm font-medium transition-colors press-shrink',
              active ? 'text-brand-600' : 'text-ink-500 hover:text-ink-900',
            )}
          >
            {t.label}
            {typeof t.count === 'number' && (
              <span className={cn('ml-1.5 text-xs', active ? 'text-brand-400' : 'text-ink-400')}>
                {t.count}
              </span>
            )}
            {active && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-500 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
