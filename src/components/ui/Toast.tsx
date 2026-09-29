import { useCallback, useEffect, useState } from 'react';

/** Notificación efímera para confirmar acciones. */
export function useToast(duracionMs = 3500) {
  const [mensaje, setMensaje] = useState<string | null>(null);
  useEffect(() => {
    if (!mensaje) return;
    const t = window.setTimeout(() => setMensaje(null), duracionMs);
    return () => window.clearTimeout(t);
  }, [mensaje, duracionMs]);

  const mostrar = useCallback((m: string) => setMensaje(m), []);
  const toast = mensaje ? (
    <div role="status" className="fixed bottom-5 right-5 z-[60] max-w-sm rounded-input bg-sena-primary px-4 py-3 font-data text-sm text-white shadow-card">
      ✓ {mensaje}
    </div>
  ) : null;
  return { mostrar, toast };
}
