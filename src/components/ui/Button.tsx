import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  block?: boolean;
}

const variantClass: Record<Variant, string> = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-brand',
  secondary: 'bg-white text-brand-700 border border-brand-200 hover:bg-brand-50 active:bg-brand-100',
  ghost: 'bg-transparent text-brand-600 hover:bg-brand-50',
  danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
  gold: 'bg-gold-500 text-white hover:bg-gold-600 shadow-sm',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm rounded-lg gap-1.5',
  md: 'h-11 px-5 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, block, className, children, disabled, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium select-none',
          'transition-all duration-200 press-shrink',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
          variantClass[variant],
          sizeClass[size],
          block && 'w-full',
          className,
        )}
        {...rest}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
