import { formatCOP } from '../../utils/format';
import { SectionCard } from '../ui/Primitives';

const ICONO = { electronica: '💻', mobiliario: '🪑', herramientas: '🛠️' };

export function ContratosGrid({ contratos, items, onEditar }) {
  return (
    <SectionCard titulo="Detalles de Inventario — Contratos">
      <div className="grid gap-4 md:grid-cols-3">
        {contratos.map((c) => {
          const propios = items.filter((i) => i.contratoId === c.id);
          const disponible = propios.reduce(
            (acc, i) => acc + i.cantidadDisponible * i.valorUnitario,
            0,
          );
          return (
            <button
              key={c.id}
              onClick={() => onEditar(c)}
              className="group flex flex-col rounded-input border-2 border-transparent bg-white p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:border-sena-primary"
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg">
                  {ICONO[c.categoria]} {c.nombre}
                </h3>
                <span className="font-title text-xs font-semibold text-sena-primary opacity-0 transition group-hover:opacity-100">
                  Editar →
                </span>
              </div>
              <p className="font-data text-xs text-gray-500">
                {c.numeroContrato} · {c.proveedor}
              </p>
              <ul className="my-3 flex-1 space-y-1 font-data text-sm">
                {propios.map((i) => (
                  <li key={i.id} className="flex justify-between gap-2">
                    <span className="truncate">{i.nombre}</span>
                    <span className="whitespace-nowrap text-gray-600">
                      {i.cantidadDisponible}/{i.cantidadTotal}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-sena-card-border pt-2 font-data text-sm">
                <p className="flex justify-between">
                  <span>Presupuesto total</span>
                  <span className="font-bold text-sena-header">{formatCOP(c.presupuesto)}</span>
                </p>
                <p className="flex justify-between text-xs text-gray-600">
                  <span>Valor disponible en bodega</span>
                  <span>{formatCOP(disponible)}</span>
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}
