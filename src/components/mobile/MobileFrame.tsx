import { ReactNode } from 'react';

interface MobileFrameProps {
  children: ReactNode;
  /** 是否带底部安全区留白 */
  bottomSafe?: boolean;
}

/** 桌面端模拟手机外壳，移动端占满 */
export function MobileFrame({ children, bottomSafe = true }: MobileFrameProps) {
  return (
    <div className="mobile-shell">
      <div className="min-h-screen flex flex-col">
        {children}
        {bottomSafe && <div className="h-4 safe-bottom" />}
      </div>
    </div>
  );
}
