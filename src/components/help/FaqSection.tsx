import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { UserRole } from '../../types';

interface Faq {
  pregunta: string;
  respuesta: string;
}

const FAQ_COMUNES: Faq[] = [
  {
    pregunta: '¿Cómo solicito un nuevo material?',
    respuesta:
      'En el Panel de Instructor pulsa "Nueva Solicitud". Selecciona los materiales de los contratos (máximo $3.000.000 COP por solicitud), diligencia el formato SENA con tu programa y tipo de formación, adjunta el PDF firmado y envía. La administración revisará y aceptará la solicitud.',
  },
  {
    pregunta: '¿Cómo devuelvo un material asignado?',
    respuesta:
      'En la tarjeta "Devolver Material" pulsa "Iniciar Devolución". Marca los materiales, indica la cantidad a entregar y confirma. La devolución queda como "Entrada" en tu historial y el inventario se actualiza al instante.',
  },
  {
    pregunta: '¿Dónde veo mis materiales asignados?',
    respuesta:
      'En la sección "Mis Materiales Asignados" del Panel de Instructor. La tabla se actualiza sola cada 2 segundos cuando la administración acepta una solicitud, y puedes buscar por nombre o código.',
  },
];

const FAQ_ADMIN: Faq[] = [
  {
    pregunta: '¿Cómo acepto una solicitud de un instructor?',
    respuesta:
      'En "Solicitudes de Materiales de Instructores" pulsa "Aceptar". Se descuentan las existencias, los materiales quedan asignados al instructor y el movimiento se registra en el historial.',
  },
  {
    pregunta: '¿Cómo edito un contrato?',
    respuesta:
      'Haz clic en la tarjeta del contrato. Puedes cambiar datos del contrato y de sus ítems; el presupuesto se recalcula y cada cambio queda en "Configuraciones Inventario".',
  },
];

export function FaqSection({ rol }: { rol: UserRole }) {
  const faqs = rol === 'administrativo' ? [...FAQ_COMUNES, ...FAQ_ADMIN] : FAQ_COMUNES;
  const [abierta, setAbierta] = useState<number | null>(0);

  return (
    <section id="faq" className="card scroll-mt-24">
      <h2 className="mb-1 text-xl">Preguntas Frecuentes</h2>
      <p className="mb-4 font-data text-sm text-gray-600">Soporte técnico para las tareas más comunes.</p>
      <ul className="space-y-3">
        {faqs.map((faq, i) => {
          const expandida = abierta === i;
          const idPanel = `faq-panel-${i}`;
          return (
            <li key={faq.pregunta} className="overflow-hidden rounded-input border-l-4 border-sena-primary bg-white shadow-sm">
              <button
                type="button"
                aria-expanded={expandida}
                aria-controls={idPanel}
                onClick={() => setAbierta(expandida ? null : i)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-title text-sm font-semibold text-sena-header hover:bg-sena-card/60"
              >
                {faq.pregunta}
                <ChevronDown className={`h-5 w-5 shrink-0 text-sena-primary transition-transform ${expandida ? 'rotate-180' : ''}`} aria-hidden />
              </button>
              {expandida && (
                <p id={idPanel} className="px-4 pb-4 font-data text-sm leading-relaxed text-gray-700">
                  {faq.respuesta}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
