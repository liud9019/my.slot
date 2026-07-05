import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const padClass = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover, padding = 'md', className, children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-2xl border border-cream-200',
          'shadow-card',
          hover && 'transition-all hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
          padClass[padding],
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = 'Card';
