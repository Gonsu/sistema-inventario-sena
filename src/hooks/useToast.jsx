// Importar herramientas de React
import { useCallback, useEffect, useState } from 'react';

// Hook para mostrar un aviso flotante que confirma una acción
// (por ejemplo: "Solicitud enviada"). Desaparece solo.
export function useToast(duracionMs = 3500) {
  // Texto del aviso; null = no se muestra nada
  const [mensaje, setMensaje] = useState(null);
  // Cuando aparece un mensaje, borrarlo automáticamente después de unos segundos
  useEffect(() => {
    if (!mensaje) return;
    const t = window.setTimeout(() => setMensaje(null), duracionMs);
    return () => window.clearTimeout(t);
  }, [mensaje, duracionMs]);

  // Función para mostrar un aviso: mostrar('Solicitud enviada')
  const mostrar = useCallback((m) => setMensaje(m), []);
  // El aviso verde que se dibuja en la esquina inferior derecha
  const toast = mensaje ? (
    <div
      role="status"
      className="fixed bottom-5 right-5 z-[60] max-w-sm rounded-input bg-sena-primary px-4 py-3 font-data text-sm text-white shadow-card"
    >
      ✓ {mensaje}
    </div>
  ) : null;
  // El componente que use este hook pone {toast} en su JSX y llama mostrar() cuando quiera
  return { mostrar, toast };
}
