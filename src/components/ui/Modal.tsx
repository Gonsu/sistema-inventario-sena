import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
  pie?: ReactNode;
  ancho?: 'md' | 'lg' | 'xl' | '2xl';
}

const ANCHOS = { md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', '2xl': 'max-w-6xl' } as const;

export function Modal({ abierto, titulo, onCerrar, children, pie, ancho = 'lg' }: ModalProps) {
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
    >
      <div className={`flex max-h-[92vh] w-full ${ANCHOS[ancho]} flex-col overflow-hidden rounded-card bg-sena-card shadow-2xl`}>
        <header className="flex items-center justify-between bg-sena-header px-5 py-3">
          <h2 className="text-lg text-white">{titulo}</h2>
          <button onClick={onCerrar} className="rounded-full p-1 text-2xl leading-none text-white/80 hover:bg-white/10 hover:text-white" aria-label="Cerrar">
            ×
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {pie && <footer className="flex flex-wrap justify-end gap-2 border-t border-sena-card-border px-5 py-3">{pie}</footer>}
      </div>
    </div>
  );
}
