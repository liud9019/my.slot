import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastViewport } from './components/ui/Toast';
import { useAuthStore } from './stores/auth';
import { seedDemoData } from './lib/seed';

import { PublisherLayout } from './layouts/PublisherLayout';
import { BookerLayout } from './layouts/BookerLayout';

import { Login } from './routes/Login';
import { Dashboard } from './routes/publisher/Dashboard';
import { Availability } from './routes/publisher/Availability';
import { Events } from './routes/publisher/Events';
import { EventEdit } from './routes/publisher/EventEdit';
import { Share } from './routes/publisher/Share';
import { Bookings } from './routes/publisher/Bookings';
import { Profile } from './routes/publisher/Profile';

import { PublicPage } from './routes/booker/PublicPage';
import { SelectSlots } from './routes/booker/SelectSlots';
import { Confirm } from './routes/booker/Confirm';
import { Success } from './routes/booker/Success';
import { MyBookings } from './routes/my/MyBookings';

export default function App() {
  const init = useAuthStore(s => s.init);

  useEffect(() => {
    // 初始化演示数据
    seedDemoData();
    // 初始化登录态
    init();
  }, [init]);

  return (
    <Router>
      <Routes>
        {/* 根路径：登录则进工作台，否则进登录 */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 通用 */}
        <Route path="/login" element={<Login />} />

        {/* 发布者端 */}
        <Route element={<PublisherLayout />}>
          <Route path="/publisher" element={<Dashboard />} />
          <Route path="/publisher/availability" element={<Availability />} />
          <Route path="/publisher/events" element={<Events />} />
          <Route path="/publisher/events/new" element={<EventEdit />} />
          <Route path="/publisher/events/:id/edit" element={<EventEdit />} />
          <Route path="/publisher/share" element={<Share />} />
          <Route path="/publisher/bookings" element={<Bookings />} />
          <Route path="/publisher/profile" element={<Profile />} />
        </Route>

        {/* 预约者端（独立入口，无需登录） */}
        <Route element={<BookerLayout />}>
          <Route path="/b/:slug" element={<PublicPage />} />
          <Route path="/b/:slug/:eventId" element={<SelectSlots />} />
          <Route path="/b/:slug/:eventId/confirm" element={<Confirm />} />
          <Route path="/b/:slug/:eventId/success" element={<Success />} />
          <Route path="/my/bookings" element={<MyBookings />} />
        </Route>

        {/* 兜底 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <ToastViewport />
    </Router>
  );
}
