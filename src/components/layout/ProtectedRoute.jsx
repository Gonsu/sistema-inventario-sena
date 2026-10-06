import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const RUTA_INICIO = {
  instructor: '/dashboard/instructor',
  administrativo: '/dashboard/administrativos',
};

export function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.rol)) return <Navigate to={RUTA_INICIO[user.rol]} replace />;
  return <>{children}</>;
}
