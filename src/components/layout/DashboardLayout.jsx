import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-sena-bg">
      <Header />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
