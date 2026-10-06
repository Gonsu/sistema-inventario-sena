import { useState } from 'react';
import { BookOpen, ChevronRight, HelpCircle, Library, PlayCircle } from 'lucide-react';

const RECURSOS = [
  {
    titulo: 'Manual de Usuario',
    descripcion: 'Guía paso a paso de todas las funciones del sistema.',
    icono: BookOpen,
  },
  {
    titulo: 'Tutoriales en Video',
    descripcion: 'Videos cortos sobre solicitudes, devoluciones y evidencias.',
    icono: PlayCircle,
  },
  {
    titulo: 'Preguntas Frecuentes extendidas',
    descripcion: 'Respuestas detalladas a las dudas más comunes.',
    icono: HelpCircle,
    ancla: '#faq',
  },
  {
    titulo: 'Base de Conocimientos',
    descripcion: 'Artículos sobre inventario, contratos y procesos SENA.',
    icono: Library,
  },
];

export function RecursosGrid() {
  const [aviso, setAviso] = useState(null);

  const abrir = (r) => {
    if (r.ancla) {
      setAviso(null);
      document.querySelector(r.ancla)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setAviso(`"${r.titulo}" estará disponible próximamente.`);
    }
  };

  return (
    <section>
      <h2 className="mb-4 text-xl">Recursos Adicionales</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {RECURSOS.map((r) => (
          <button
            key={r.titulo}
            type="button"
            onClick={() => abrir(r)}
            className="card group flex items-start gap-4 text-left transition hover:-translate-y-1 hover:border-sena-primary hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-sena-primary"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-input bg-sena-primary/10 text-sena-primary transition group-hover:bg-sena-primary group-hover:text-white">
              <r.icono className="h-6 w-6" aria-hidden />
            </span>
            <span className="flex-1">
              <span className="block font-title text-base font-bold text-sena-header">
                {r.titulo}
              </span>
              <span className="block font-data text-sm text-gray-600">{r.descripcion}</span>
            </span>
            <ChevronRight
              className="h-5 w-5 shrink-0 self-center text-sena-primary transition group-hover:translate-x-1"
              aria-hidden
            />
          </button>
        ))}
      </div>
      {aviso && (
        <p role="status" className="mt-3 font-data text-sm text-sena-header">
          {aviso}
        </p>
      )}
    </section>
  );
}
