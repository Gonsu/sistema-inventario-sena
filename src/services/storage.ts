// ============================================================
// Capa de acceso a localStorage.
// Toda escritura notifica a la pestaña actual (evento propio) para que
// la UI responda sin esperar al siguiente ciclo de polling; las demás
// pestañas se enteran por el polling de 2 s (y por el evento `storage`).
// ============================================================

export const STORAGE_CHANGE_EVENT = 'sena-storage-change';

export class StorageQuotaError extends Error {
  constructor() {
    super(
      'No hay espacio suficiente en el almacenamiento local. Reduce el tamaño de los archivos adjuntos o elimina registros antiguos.',
    );
    this.name = 'StorageQuotaError';
  }
}

export function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function parseJSON<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readJSON<T>(key: string, fallback: T): T {
  return parseJSON(readRaw(key), fallback);
}

function isQuotaError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  );
}

export function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    if (isQuotaError(err)) throw new StorageQuotaError();
    throw err;
  }
  window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT, { detail: { key } }));
}

/**
 * Escribe varias claves como una sola operación: si alguna falla por cuota,
 * restaura los valores previos para no dejar el estado a medias.
 */
export function writeMany(entries: Array<[string, unknown]>): void {
  const previous = entries.map(([key]) => [key, readRaw(key)] as const);
  try {
    for (const [key, value] of entries) localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    for (const [key, raw] of previous) {
      if (raw === null) localStorage.removeItem(key);
      else localStorage.setItem(key, raw);
    }
    if (isQuotaError(err)) throw new StorageQuotaError();
    throw err;
  }
  for (const [key] of entries) {
    window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT, { detail: { key } }));
  }
}

export function removeKey(key: string): void {
  localStorage.removeItem(key);
  window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT, { detail: { key } }));
}
