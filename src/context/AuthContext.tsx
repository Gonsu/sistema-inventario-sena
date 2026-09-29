import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { LoginCredentials, PublicUser, Session } from '../types';
import { cerrarSesion, iniciarSesion, obtenerSesion, usuarioDeSesion } from '../services/auth';
import { useUsuarios } from '../hooks/useInventarioData';

interface AuthContextValue {
  user: PublicUser | null;
  login: (cred: LoginCredentials) => Promise<PublicUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => obtenerSesion());
  // Los usuarios sí se sincronizan: si un usuario se desactiva, su sesión deja de ser válida.
  const usuarios = useUsuarios();
  const user = useMemo(() => (usuarios.length ? usuarioDeSesion(session) : null), [session, usuarios]);

  const login = useCallback(async (cred: LoginCredentials) => {
    const u = await iniciarSesion(cred);
    setSession(obtenerSesion());
    return u;
  }, []);
  const logout = useCallback(() => {
    cerrarSesion();
    setSession(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return ctx;
}

/** Para vistas protegidas: el usuario siempre existe dentro de <ProtectedRoute>. */
export function useUsuarioActual(): PublicUser {
  const { user } = useAuth();
  if (!user) throw new Error('No hay una sesión activa.');
  return user;
}
