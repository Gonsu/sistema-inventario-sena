// Importar Navigate para redirigir a otra ruta
import { Navigate } from 'react-router-dom';

// Importar el contexto de sesión
import { useAuth } from '../../context/AuthContext';

// Importar a qué panel debe ir cada rol
import { RUTA_INICIO } from '../../utils/constants';

// Protege una ruta: solo deja pasar si hay sesión y el rol está permitido.
// roles: lista de roles que pueden entrar (si no se envía, entra cualquiera con sesión)
function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  // Sin sesión: mandar al login
  if (!user) return <Navigate to="/login" replace />;
  // Rol no permitido: mandar a su propio panel
  if (roles && !roles.includes(user.rol)) return <Navigate to={RUTA_INICIO[user.rol]} replace />;
  // Todo bien: mostrar el contenido protegido
  return <>{children}</>;
}

export default ProtectedRoute;
