// Importar herramientas básicas de React
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

// Importar las funciones de inicio de sesión
import { cerrarSesion, iniciarSesion, obtenerSesion, usuarioDeSesion } from '../services/auth';

// Importar los datos del inventario (se actualizan solos cuando cambian)
import { useUsuarios } from '../hooks/useInventarioData';

// Crear el contexto: es como una "caja" que comparte el usuario con toda la aplicación
const AuthContext = createContext(null);

// Componente que envuelve la aplicación y guarda la sesión
export function AuthProvider({ children }) {
  // Sesión guardada en esta pestaña
  const [session, setSession] = useState(() => obtenerSesion());
  // Los usuarios sí se sincronizan: si un usuario se desactiva, su sesión deja de ser válida.
  const usuarios = useUsuarios();
  const user = useMemo(
    () => (usuarios.length ? usuarioDeSesion(session) : null),
    [session, usuarios],
  );

  // Iniciar sesión y actualizar el estado
  const login = useCallback(async (cred) => {
    const u = await iniciarSesion(cred);
    setSession(obtenerSesion());
    return u;
  }, []);
  // Cerrar sesión
  const logout = useCallback(() => {
    cerrarSesion();
    setSession(null);
  }, []);

  // Lo que se comparte: el usuario y las funciones para entrar y salir
  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook para leer la sesión desde cualquier componente: const { user, login, logout } = useAuth()
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return ctx;
}

// Para las vistas protegidas: devuelve el usuario directamente
// (dentro de <ProtectedRoute> siempre hay un usuario)
export function useUsuarioActual() {
  const { user } = useAuth();
  if (!user) throw new Error('No hay una sesión activa.');
  return user;
}
