import { Outlet, Navigate } from 'react-router-dom';
import { MobileFrame } from '../components/mobile/MobileFrame';
import { TabBar } from '../components/mobile/TabBar';
import { useAuthStore } from '../stores/auth';
import { useEffect } from 'react';

export function PublisherLayout() {
  const session = useAuthStore(s => s.session);
  const init = useAuthStore(s => s.init);

  useEffect(() => { init(); }, [init]);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MobileFrame>
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <Outlet />
        </main>
        <TabBar />
      </div>
    </MobileFrame>
  );
}
