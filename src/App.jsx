import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute, RUTA_INICIO } from './components/layout/ProtectedRoute';
import LoginPage from './pages/LoginPage';

const InstructorDashboard = lazy(() => import('./pages/InstructorDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AyudaPage = lazy(() => import('./pages/AyudaPage'));
const ReportesPage = lazy(() => import('./pages/ReportesPage'));

function Inicio() {
  const { user } = useAuth();
  return <Navigate to={user ? RUTA_INICIO[user.rol] : '/login'} replace />;
}

const Cargando = () => <p className="p-8 text-center font-data text-sena-header">Cargando…</p>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Cargando />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route
                path="/dashboard/instructor"
                element={
                  <ProtectedRoute roles={['instructor']}>
                    <InstructorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/administrativos"
                element={
                  <ProtectedRoute roles={['administrativo']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/reportes"
                element={
                  <ProtectedRoute roles={['administrativo']}>
                    <ReportesPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/reportes" element={<Navigate to="/dashboard/reportes" replace />} />
              <Route path="/dashboard/ayuda" element={<AyudaPage />} />
              <Route path="/ayuda" element={<Navigate to="/dashboard/ayuda" replace />} />
            </Route>
            <Route path="*" element={<Inicio />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
