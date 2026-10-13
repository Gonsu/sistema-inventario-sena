// ============================================================
// Inicio y cierre de sesión.
// Solo funciona en el navegador: sirve para la demostración, no da seguridad real.
// ============================================================

// Importar los nombres de las claves del almacenamiento
import { STORAGE_KEYS } from '../utils/constants';

// Importar la función para leer del localStorage
import { readJSON } from './storage';

// Cifra un texto con SHA-256 (así las contraseñas no se guardan tal cual)
export async function sha256Hex(texto) {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Quita la contraseña cifrada del usuario antes de mostrarlo en pantalla
export function aUsuarioPublico({ passwordHash: _omit, ...rest }) {
  return rest;
}

// Lista de todos los usuarios guardados
export function obtenerUsuarios() {
  return readJSON(STORAGE_KEYS.users, []);
}

// La sesión vive en sessionStorage (por pestaña) para que un instructor y un
// administrativo puedan trabajar en pestañas distintas del mismo navegador.
// Los datos del inventario sí se comparten vía localStorage.
export function obtenerSesion() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.session);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Busca el usuario de la sesión (si sigue activo)
export function usuarioDeSesion(session) {
  if (!session) return null;
  const user = obtenerUsuarios().find((u) => u.id === session.userId && u.activo);
  return user ? aUsuarioPublico(user) : null;
}

// Valida correo, contraseña y rol. Si están bien, guarda la sesión.
// Si no, lanza un error con el mensaje para el usuario.
export async function iniciarSesion(cred) {
  const correo = cred.correo.trim().toLowerCase();
  const hash = await sha256Hex(cred.password);
  const user = obtenerUsuarios().find(
    (u) => u.correo.toLowerCase() === correo && u.rol === cred.rol && u.activo,
  );
  if (!user || user.passwordHash !== hash) {
    throw new Error('Credenciales inválidas para el rol seleccionado.');
  }
  const session = {
    userId: user.id,
    rol: user.rol,
    iniciadaEn: new Date().toISOString(),
  };
  sessionStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
  return aUsuarioPublico(user);
}

// Borra la sesión de esta pestaña
export function cerrarSesion() {
  sessionStorage.removeItem(STORAGE_KEYS.session);
}
