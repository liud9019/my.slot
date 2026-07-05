import { Outlet } from 'react-router-dom';
import { MobileFrame } from '../components/mobile/MobileFrame';

/** 预约者端简洁布局：无 TabBar，仅顶栏由各页自己渲染 */
export function BookerLayout() {
  return (
    <MobileFrame>
      <main className="flex-1 overflow-y-auto no-scrollbar">
        <Outlet />
      </main>
    </MobileFrame>
  );
}
