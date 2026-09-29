import { useEffect, useMemo, useRef, useState } from 'react';
import { POLLING_INTERVAL_MS } from '../utils/constants';
import { parseJSON, readRaw, STORAGE_CHANGE_EVENT } from '../services/storage';

/**
 * Suscribe un componente a una clave de localStorage.
 *
 * - Polling cada POLLING_INTERVAL_MS (2 s): garantiza la sincronización entre
 *   pestañas aunque el evento `storage` no se dispare (p. ej. iframes o
 *   navegadores que lo limitan).
 * - Evento `storage`: actualización inmediata cuando otra pestaña escribe.
 * - Evento propio STORAGE_CHANGE_EVENT: actualización inmediata en la misma pestaña.
 *
 * Solo re-renderiza cuando el string crudo cambia, así que el polling es barato.
 */
export function useLocalStorageSync<T>(key: string, fallback: T): T {
  const [raw, setRaw] = useState<string | null>(() => readRaw(key));
  const fallbackRef = useRef(fallback);

  useEffect(() => {
    const sincronizar = () => {
      const siguiente = readRaw(key);
      setRaw((actual) => (actual === siguiente ? actual : siguiente));
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === key) sincronizar();
    };
    const onLocal = (e: Event) => {
      if ((e as CustomEvent<{ key: string }>).detail?.key === key) sincronizar();
    };

    sincronizar();
    const intervalo = window.setInterval(sincronizar, POLLING_INTERVAL_MS);
    window.addEventListener('storage', onStorage);
    window.addEventListener(STORAGE_CHANGE_EVENT, onLocal);
    return () => {
      window.clearInterval(intervalo);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(STORAGE_CHANGE_EVENT, onLocal);
    };
  }, [key]);

  return useMemo(() => parseJSON(raw, fallbackRef.current), [raw]);
}
