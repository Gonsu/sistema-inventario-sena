// ============================================================
// Funciones para leer y guardar datos en el localStorage del navegador.
//
// Cada vez que se guarda algo, se avisa a la pestaña actual con un evento
// para que la pantalla se actualice al instante. Las demás pestañas se
// enteran porque revisan el localStorage cada 2 segundos.
// ============================================================

// Nombre del evento que avisa a la pestaña actual que algo cambió
export const STORAGE_CHANGE_EVENT = 'sena-storage-change';

// Error que se lanza cuando el localStorage se llena (~5 MB)
export class StorageQuotaError extends Error {
  constructor() {
    super(
      'No hay espacio suficiente en el almacenamiento local. Reduce el tamaño de los archivos adjuntos o elimina registros antiguos.',
    );
    this.name = 'StorageQuotaError';
  }
}

// Lee el texto guardado en una clave (o null si no existe)
export function readRaw(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

// Convierte el texto en objeto; si está vacío o dañado devuelve el valor por defecto
export function parseJSON(raw, fallback) {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

// Lee una clave y la devuelve ya convertida en objeto
export function readJSON(key, fallback) {
  return parseJSON(readRaw(key), fallback);
}

// ¿El error fue porque se llenó el almacenamiento?
function isQuotaError(err) {
  return (
    err instanceof DOMException &&
    (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  );
}

// Guarda un valor en una clave y avisa a la pantalla que cambió
export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    if (isQuotaError(err)) throw new StorageQuotaError();
    throw err;
  }
  window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT, { detail: { key } }));
}

// Guarda varias claves de una sola vez.
// Si alguna falla (por ejemplo, porque se llenó el espacio), deja todo como estaba
// para que los datos no queden a medias.
export function writeMany(entries) {
  const previous = entries.map(([key]) => [key, readRaw(key)]);
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

// Borra una clave y avisa a la pantalla
export function removeKey(key) {
  localStorage.removeItem(key);
  window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT, { detail: { key } }));
}
