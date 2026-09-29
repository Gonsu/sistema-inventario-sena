import type { LoginCredentials, PublicUser, Session, User } from '../types';
import { STORAGE_KEYS } from '../utils/constants';
import { readJSON } from './storage';

export async function sha256Hex(texto: string): Promise<string> {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function aUsuarioPublico({ passwordHash: _omit, ...rest }: User): PublicUser {
  return rest;
}

export function obtenerUsuarios(): User[] {
  return readJSON<User[]>(STORAGE_KEYS.users, []);
}

// La sesión vive en sessionStorage (por pestaña) para que un instructor y un
// administrativo puedan trabajar en pestañas distintas del mismo navegador.
// Los datos del inventario sí se comparten vía localStorage.
export function obtenerSesion(): Session | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.session);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function usuarioDeSesion(session: Session | null): PublicUser | null {
  if (!session) return null;
  const user = obtenerUsuarios().find((u) => u.id === session.userId && u.activo);
  return user ? aUsuarioPublico(user) : null;
}

export async function iniciarSesion(cred: LoginCredentials): Promise<PublicUser> {
  const correo = cred.correo.trim().toLowerCase();
  const hash = await sha256Hex(cred.password);
  const user = obtenerUsuarios().find(
    (u) => u.correo.toLowerCase() === correo && u.rol === cred.rol && u.activo,
  );
  if (!user || user.passwordHash !== hash) {
    throw new Error('Credenciales inválidas para el rol seleccionado.');
  }
  const session: Session = { userId: user.id, rol: user.rol, iniciadaEn: new Date().toISOString() };
  sessionStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
  return aUsuarioPublico(user);
}

export function cerrarSesion(): void {
  sessionStorage.removeItem(STORAGE_KEYS.session);
}
