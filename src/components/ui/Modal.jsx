// Importar useEffect para escuchar el teclado mientras la ventana está abierta
import { useEffect } from 'react';

// Anchos disponibles para la ventana
const ANCHOS = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
};

// Ventana emergente base que usan todos los modales del sistema.
// Recibe:
//  - abierto: si se muestra o no
//  - titulo: texto de la barra verde
//  - onCerrar: función que se ejecuta al cerrar
//  - pie: botones de abajo (opcional)
//  - ancho: 'md', 'lg', 'xl' o '2xl'
function Modal({ abierto, titulo, onCerrar, children, pie, ancho = 'lg' }) {
  // Mientras está abierta: cerrar con la tecla Escape y bloquear el scroll de la página
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e) => e.key === 'Escape' && onCerrar();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    // Al cerrarse, quitar el listener y devolver el scroll
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [abierto, onCerrar]);

  // Si no está abierta, no se dibuja nada
  if (!abierto) return null;
  // Fondo oscuro: si se hace clic afuera de la ventana, se cierra
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
    >
      <div
        className={`flex max-h-[92vh] w-full ${ANCHOS[ancho]} flex-col overflow-hidden rounded-card bg-sena-card shadow-2xl`}
      >
        {/* Barra verde con el título y la X para cerrar */}
        <header className="flex items-center justify-between bg-sena-header px-5 py-3">
          <h2 className="text-lg text-white">{titulo}</h2>
          <button
            onClick={onCerrar}
            className="rounded-full p-1 text-2xl leading-none text-white/80 hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>
        {/* Contenido de la ventana (con scroll si es largo) */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {/* Botones de abajo (solo si se enviaron) */}
        {pie && (
          <footer className="flex flex-wrap justify-end gap-2 border-t border-sena-card-border px-5 py-3">
            {pie}
          </footer>
        )}
      </div>
    </div>
  );
}

export default Modal;
