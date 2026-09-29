import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const RUTA_INICIO: Record<UserRole, string> = {
  instructor: '/dashboard/instructor',
  administrativo: '/dashboard/administrativos',
};

export function ProtectedRoute({ roles, children }: { roles?: UserRole[]; children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.rol)) return <Navigate to={RUTA_INICIO[user.rol]} replace />;
  return <>{children}</>;
}
