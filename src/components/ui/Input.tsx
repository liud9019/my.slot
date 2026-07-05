import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  suffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, suffix, className, id, ...rest }, ref) => {
    const autoId = useId();
    const inputId = id || autoId;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-ink-900">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full h-12 px-4 rounded-xl bg-white border transition-colors',
              'text-ink-900 placeholder:text-ink-400',
              'focus:ring-2 focus:ring-brand-200 focus:border-brand-400',
              error ? 'border-red-300' : 'border-cream-200',
              suffix && 'pr-20',
              className,
            )}
            {...rest}
          />
          {suffix && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {suffix}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-red-500">{error}</p>
        ) : hint ? (
          <p className="text-xs text-ink-400">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...rest }, ref) => {
    const autoId = useId();
    const inputId = id || autoId;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-ink-900">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            'w-full min-h-[96px] p-4 rounded-xl bg-white border transition-colors resize-none',
            'text-ink-900 placeholder:text-ink-400',
            'focus:ring-2 focus:ring-brand-200 focus:border-brand-400',
            error ? 'border-red-300' : 'border-cream-200',
            className,
          )}
          {...rest}
        />
        {error ? (
          <p className="text-xs text-red-500">{error}</p>
        ) : hint ? (
          <p className="text-xs text-ink-400">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
