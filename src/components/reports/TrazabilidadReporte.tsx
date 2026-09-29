import type { InventarioResumen, SemaforoNivel, TrazabilidadRow } from '../../types';
import type { FiltrosTrazabilidad } from '../../services/reportes';
import { SEMAFORO_UMBRALES } from '../../utils/constants';
import { EmptyState, MetricCard, SectionCard } from '../ui/Primitives';

const SEMAFORO: Record<SemaforoNivel, { color: string; label: string }> = {
  verde: { color: 'bg-semaforo-verde', label: `< ${SEMAFORO_UMBRALES.verdeMax + 1} días` },
  amarillo: { color: 'bg-semaforo-amarillo', label: `${SEMAFORO_UMBRALES.verdeMax + 1}–${SEMAFORO_UMBRALES.amarilloMax} días` },
  rojo: { color: 'bg-semaforo-rojo', label: `≥ ${SEMAFORO_UMBRALES.amarilloMax + 1} días` },
};

interface Props {
  filtros: FiltrosTrazabilidad;
  onFiltros: (f: FiltrosTrazabilidad) => void;
  filas: TrazabilidadRow[];
  resumen: InventarioResumen;
}

export function TrazabilidadReporte({ filtros, onFiltros, filas, resumen }: Props) {
  const campo = (k: 'material' | 'ubicacion' | 'instructor', placeholder: string) => (
    <input
      type="search"
      className="input mt-1 py-1 text-xs font-normal normal-case text-gray-800"
      value={filtros[k]}
      onChange={(e) => onFiltros({ ...filtros, [k]: e.target.value })}
      placeholder={placeholder}
      aria-label={placeholder}
    />
  );

  return (
    <SectionCard
      titulo="Trazabilidad de Material"
      acciones={
        <ul className="flex flex-wrap gap-3 font-data text-xs text-gray-700" aria-label="Leyenda del semáforo">
          {(Object.keys(SEMAFORO) as SemaforoNivel[]).map((n) => (
            <li key={n} className="flex items-center gap-1">
              <span className={`h-3 w-3 rounded-full ${SEMAFORO[n].color}`} aria-hidden /> {SEMAFORO[n].label}
            </li>
          ))}
        </ul>
      }
    >
      <div className="max-h-96 overflow-auto rounded-input">
        <table className="table-base">
          <thead>
            <tr>
              <th className="align-top">Material{campo('material', 'Buscar material')}</th>
              <th className="align-top">Ubicación Actual{campo('ubicacion', 'Buscar ubicación')}</th>
              <th className="align-top">Instructor Asignado{campo('instructor', 'Buscar instructor')}</th>
              <th className="align-top">
                Días en Uso
                <select
                  className="input mt-1 py-1 text-xs font-normal normal-case text-gray-800"
                  value={filtros.semaforo}
                  onChange={(e) => onFiltros({ ...filtros, semaforo: e.target.value as SemaforoNivel | '' })}
                  aria-label="Filtrar por semáforo"
                >
                  <option value="">Todos</option>
                  <option value="verde">Verde</option>
                  <option value="amarillo">Amarillo</option>
                  <option value="rojo">Rojo</option>
                </select>
              </th>
            </tr>
          </thead>
          <tbody>
            {filas.length === 0 ? (
              <tr><td colSpan={4}><EmptyState mensaje="No hay materiales en uso que coincidan." /></td></tr>
            ) : (
              filas.map((f) => (
                <tr key={f.asignacionId}>
                  <td>
                    <p className="font-semibold">{f.material}</p>
                    <p className="text-xs text-gray-500">{f.codigo}</p>
                  </td>
                  <td>{f.ubicacionActual}</td>
                  <td>{f.instructorAsignado}</td>
                  <td>
                    <span className="inline-flex items-center gap-2">
                      <span className={`h-3.5 w-3.5 rounded-full ${SEMAFORO[f.semaforo].color}`} title={`Semáforo ${f.semaforo}`} aria-label={`Semáforo ${f.semaforo}`} />
                      <span className="font-semibold">{f.diasEnUso}</span> días
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <MetricCard etiqueta="Total Materiales" valor={resumen.totalMateriales} />
        <MetricCard etiqueta="En Uso" valor={resumen.enUso} />
        <MetricCard etiqueta="Disponibles" valor={resumen.disponibles} />
      </div>
    </SectionCard>
  );
}
