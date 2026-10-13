// Importar herramientas básicas de React
import { useMemo } from 'react';

// Importar los datos del inventario (se actualizan solos cuando cambian)
import { useCatalogo, useMovimientos } from '../../hooks/useInventarioData';

// Importar funciones de formato (pesos, fechas) y búsqueda
import { formatFecha } from '../../utils/format';

// Importar componentes visuales reutilizables
import EmptyState from '../ui/EmptyState';

// Lista de movimientos del instructor:
//  - Salidas: materiales que le entregaron (solicitudes aceptadas)
//  - Entradas: materiales que devolvió a bodega
function HistorialMovimientosInstructor({ instructorId }) {
  // Datos del inventario
  const movimientos = useMovimientos();
  const { itemPorId, nombreUsuario } = useCatalogo();

  // Solo los movimientos de este instructor, del más reciente al más antiguo
  const propios = useMemo(
    () =>
      movimientos
        .filter(
          (m) =>
            m.instructorId === instructorId && (m.tipo === 'asignacion' || m.tipo === 'devolucion'),
        )
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [movimientos, instructorId],
  );

  // Si no hay movimientos, mostrar un mensaje
  if (propios.length === 0) return <EmptyState mensaje="Aún no hay movimientos registrados." />;

  return (
    <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
      {propios.map((m) => {
        // Salida = material que recibió (rojo); Entrada = material que devolvió (verde)
        const salida = m.tipo === 'asignacion';
        return (
          <li
            key={m.id}
            className={`rounded-input border-l-4 bg-white/70 p-3 ${salida ? 'border-red-600' : 'border-green-600'}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={`font-title text-sm font-bold ${salida ? 'text-red-600' : 'text-green-700'}`}
              >
                {salida ? '↑ Salida' : '↓ Entrada'}
              </span>
              <span className="font-data text-xs text-gray-500">{formatFecha(m.fecha)}</span>
            </div>
            <p className="font-data text-xs text-gray-600">
              Instructor: {nombreUsuario(m.instructorId)}
            </p>
            <ul className="mt-1 font-data text-sm">
              {(m.detalle ?? []).map((d) => (
                <li key={d.itemId}>
                  {itemPorId.get(d.itemId)?.nombre ?? 'Material eliminado'}{' '}
                  <span className="font-semibold">× {d.cantidad}</span>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}

export default HistorialMovimientosInstructor;
