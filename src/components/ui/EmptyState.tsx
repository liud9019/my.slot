import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      {icon && (
        <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center mb-4 text-brand-300">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-ink-900 mb-1.5 font-serif">{title}</h3>
      {description && (
        <p className="text-sm text-ink-500 max-w-[260px] mb-5 leading-relaxed">{description}</p>
      )}
      {action}
    </div>
  );
}
