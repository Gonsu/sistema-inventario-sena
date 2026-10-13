// Importar funciones de formato (pesos, fechas) y búsqueda
import { formatCOP } from '../../utils/format';

// Importar componentes visuales reutilizables
import SectionCard from '../ui/SectionCard';

// Ícono que acompaña a cada tipo de contrato
const ICONO = { electronica: '💻', mobiliario: '🪑', herramientas: '🛠️' };

// Tarjetas con el resumen de cada contrato (Electrónica, Mobiliario, Herramientas).
// Al hacer clic en una tarjeta se abre la ventana para editar ese contrato.
function ContratosGrid({ contratos, items, onEditar }) {
  return (
    <SectionCard titulo="Detalles de Inventario — Contratos">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Crear una tarjeta por cada contrato */}
        {contratos.map((c) => {
          // Materiales que pertenecen a este contrato
          const propios = items.filter((i) => i.contratoId === c.id);
          // Valor en pesos de lo que queda en bodega (cantidad disponible × valor unitario)
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
              {/* Nombre del contrato y texto "Editar" que aparece al pasar el mouse */}
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
              {/* Lista de materiales con disponibles / total */}
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
              {/* Presupuesto del contrato y valor que queda en bodega */}
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

export default ContratosGrid;
