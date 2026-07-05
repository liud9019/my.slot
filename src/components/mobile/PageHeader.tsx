import { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  backFallback?: string;  // 返回不到历史时跳转的路径
  right?: ReactNode;
  transparent?: boolean;
  className?: string;
}

export function PageHeader({ title, subtitle, onBack, backFallback, right, transparent, className }: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) return onBack();
    if (window.history.length > 1) {
      navigate(-1);
    } else if (backFallback) {
      navigate(backFallback, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-30 safe-top',
        transparent ? 'bg-transparent' : 'bg-cream-50/90 backdrop-blur-lg border-b border-cream-200',
        className,
      )}
    >
      <div className="h-14 px-4 flex items-center gap-2">
        <button
          onClick={handleBack}
          className="w-9 h-9 -ml-1 flex items-center justify-center rounded-full hover:bg-cream-200 transition-colors text-ink-900"
          aria-label="返回"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          {title && (
            <h1 className="text-base font-semibold text-ink-900 truncate font-serif">{title}</h1>
          )}
          {subtitle && (
            <p className="text-xs text-ink-500 truncate">{subtitle}</p>
          )}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </header>
  );
}

interface SimpleHeaderProps {
  title: string;
  right?: ReactNode;
}

/** 居中标题、无返回的简洁顶栏 */
export function SimpleHeader({ title, right }: SimpleHeaderProps) {
  return (
    <header className="sticky top-0 z-30 safe-top bg-cream-50/90 backdrop-blur-lg border-b border-cream-200">
      <div className="h-14 px-4 flex items-center">
        <h1 className="flex-1 text-base font-semibold text-ink-900 font-serif text-center">{title}</h1>
        <div className="absolute right-4 top-0 h-14 flex items-center">
          {right}
        </div>
      </div>
    </header>
  );
}
