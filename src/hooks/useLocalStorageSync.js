// Importar herramientas básicas de React
import { useEffect, useMemo, useRef, useState } from 'react';

// Importar constantes del sistema
import { POLLING_INTERVAL_MS } from '../utils/constants';

// Importar las funciones para leer y guardar en localStorage
import { parseJSON, readRaw, STORAGE_CHANGE_EVENT } from '../services/storage';

// Hook que lee una clave del localStorage y la mantiene actualizada.
// Se entera de los cambios de tres formas:
//  - Revisando cada 2 segundos (funciona siempre, incluso entre pestañas)
//  - Con el evento "storage": cuando otra pestaña guarda algo
//  - Con nuestro evento propio: cuando esta misma pestaña guarda algo
// Solo vuelve a dibujar el componente si el dato realmente cambió.
export function useLocalStorageSync(key, fallback) {
  const [raw, setRaw] = useState(() => readRaw(key));
  const fallbackRef = useRef(fallback);

  useEffect(() => {
    const sincronizar = () => {
      const siguiente = readRaw(key);
      setRaw((actual) => (actual === siguiente ? actual : siguiente));
    };
    const onStorage = (e) => {
      if (e.key === null || e.key === key) sincronizar();
    };
    const onLocal = (e) => {
      if (e.detail?.key === key) sincronizar();
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
