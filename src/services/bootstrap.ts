import type { User } from '../types';
import { construirInventarioInicial, USUARIOS_SEED } from '../data/seed';
import { STORAGE_KEYS } from '../utils/constants';
import { sha256Hex } from './auth';
import { readRaw, writeJSON } from './storage';

/** Siembra datos iniciales solo en las claves que aún no existen. */
export async function inicializarAlmacenamiento(): Promise<void> {
  if (readRaw(STORAGE_KEYS.users) === null) {
    const ahora = new Date().toISOString();
    const users: User[] = await Promise.all(
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

  if (readRaw(STORAGE_KEYS.contratos) === null || readRaw(STORAGE_KEYS.items) === null) {
    const { contratos, items } = construirInventarioInicial();
    writeJSON(STORAGE_KEYS.contratos, contratos);
    writeJSON(STORAGE_KEYS.items, items);
  }

  for (const key of [
    STORAGE_KEYS.asignaciones,
    STORAGE_KEYS.movimientos,
    STORAGE_KEYS.solicitudes,
    STORAGE_KEYS.evidencias,
  ]) {
    if (readRaw(key) === null) writeJSON(key, []);
  }
}
