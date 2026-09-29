import type { ReactNode } from 'react';

export function SectionCard({ titulo, acciones, children, className = '' }: { titulo: string; acciones?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`card ${className}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl">{titulo}</h2>
        {acciones}
      </div>
      {children}
    </section>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Buscar…' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative w-full sm:w-72">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>⌕</span>
      <input type="search" className="input pl-8" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
    </div>
  );
}

export function EmptyState({ mensaje }: { mensaje: string }) {
  return <p className="rounded-input border border-dashed border-sena-card-border bg-white/50 px-4 py-8 text-center font-data text-gray-500">{mensaje}</p>;
}

/** Badge circular verde medio para cantidades. */
export function CantidadBadge({ valor }: { valor: number }) {
  return (
    <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-sena-primary px-2 font-title text-sm font-bold text-white">
      {valor}
    </span>
  );
}

const TONOS = {
  verde: 'bg-green-100 text-green-800 ring-green-600/30',
  verdeOscuro: 'bg-sena-header text-white ring-sena-header',
  rojo: 'bg-red-100 text-red-700 ring-red-600/30',
  amarillo: 'bg-yellow-100 text-yellow-800 ring-yellow-600/30',
  gris: 'bg-gray-100 text-gray-700 ring-gray-500/30',
} as const;

export function Badge({ tono = 'verde', children }: { tono?: keyof typeof TONOS; children: ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-title text-xs font-semibold ring-1 ring-inset ${TONOS[tono]}`}>{children}</span>;
}

export function Alerta({ tipo = 'error', children }: { tipo?: 'error' | 'exito'; children: ReactNode }) {
  const estilos = tipo === 'error' ? 'border-red-300 bg-red-50 text-red-700' : 'border-green-300 bg-green-50 text-green-800';
  return <div role={tipo === 'error' ? 'alert' : 'status'} className={`rounded-input border px-3 py-2 font-data text-sm ${estilos}`}>{children}</div>;
}

export function MetricCard({ etiqueta, valor, children }: { etiqueta: string; valor?: ReactNode; children?: ReactNode }) {
  return (
    <div className="card flex flex-col justify-between gap-3">
      <p className="font-title text-xs font-semibold uppercase tracking-wide text-sena-primary">{etiqueta}</p>
      {valor !== undefined && <p className="font-title text-4xl font-extrabold text-sena-header">{valor}</p>}
      {children}
    </div>
  );
}
