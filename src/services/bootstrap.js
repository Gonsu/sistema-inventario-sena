// ============================================================
// Carga de datos iniciales.
// La primera vez que se abre la aplicación en un navegador, guarda en el
// localStorage los usuarios de prueba, los contratos y los materiales.
// ============================================================

// Importar los datos de prueba
import { construirInventarioInicial, USUARIOS_SEED } from '../data/seed';

// Importar los nombres de las claves del localStorage
import { STORAGE_KEYS } from '../utils/constants';

// Importar la función que cifra las contraseñas
import { sha256Hex } from './auth';

// Importar las funciones para leer y guardar en localStorage
import { readRaw, writeJSON } from './storage';

// Guarda los datos iniciales, pero solo los que todavía no existen
// (así no se borra lo que el usuario ya ha hecho).
export async function inicializarAlmacenamiento() {
  // 1. Usuarios de prueba (las contraseñas se guardan cifradas con SHA-256)
  if (readRaw(STORAGE_KEYS.users) === null) {
    const ahora = new Date().toISOString();
    const users = await Promise.all(
      USUARIOS_SEED.map(async (u) => ({
        id: u.id,
        nombre: u.nombre,
        correo: u.correo,
        rol: u.rol,
        passwordHash: await sha256Hex(u.password),
        activo: true,
        creadoEn: ahora,
      })),
    );
    writeJSON(STORAGE_KEYS.users, users);
  }

  // 2. Contratos y materiales iniciales
  if (readRaw(STORAGE_KEYS.contratos) === null || readRaw(STORAGE_KEYS.items) === null) {
    const { contratos, items } = construirInventarioInicial();
    writeJSON(STORAGE_KEYS.contratos, contratos);
    writeJSON(STORAGE_KEYS.items, items);
  }

  // 3. Las demás listas empiezan vacías
  for (const key of [
    STORAGE_KEYS.asignaciones,
    STORAGE_KEYS.movimientos,
    STORAGE_KEYS.solicitudes,
    STORAGE_KEYS.evidencias,
  ]) {
    if (readRaw(key) === null) writeJSON(key, []);
  }
}
