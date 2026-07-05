import { CheckCircle2, XCircle, Info, Loader2, X } from 'lucide-react';
import { useToastStore } from '../../stores/toast';
import { cn } from '../../lib/utils';

export function ToastViewport() {
  const toasts = useToastStore(s => s.toasts);
  const dismiss = useToastStore(s => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none safe-top">
      {toasts.map(t => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex items-center gap-2.5 max-w-[420px] w-full',
            'px-4 py-3 rounded-xl shadow-lg backdrop-blur-md',
            'animate-slide-up',
            t.type === 'success' && 'bg-white/95 border border-brand-100 text-ink-900',
            t.type === 'error' && 'bg-white/95 border border-red-200 text-ink-900',
            t.type === 'info' && 'bg-white/95 border border-cream-200 text-ink-900',
            t.type === 'loading' && 'bg-ink-900/95 text-white',
          )}
        >
          {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />}
          {t.type === 'error' && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
          {t.type === 'info' && <Info className="w-5 h-5 text-brand-400 shrink-0" />}
          {t.type === 'loading' && <Loader2 className="w-5 h-5 text-white animate-spin shrink-0" />}
          <span className="text-sm flex-1">{t.message}</span>
          {t.type !== 'loading' && (
            <button
              onClick={() => dismiss(t.id)}
              className="text-ink-400 hover:text-ink-900 transition-colors"
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
