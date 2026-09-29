import type { FilaCosto, FiltrosCostos } from '../../services/reportes';
import { formatCOP } from '../../utils/format';
import { COORDINACION_LABEL } from '../../utils/labels';
import { EmptyState, MetricCard, SearchInput, SectionCard } from '../ui/Primitives';
import { ContratoBadge, FiltroContratoSelect, FiltroCoordinacionSelect } from './Controles';

interface Props {
  filtros: FiltrosCostos;
  onFiltros: (f: FiltrosCostos) => void;
  filas: FilaCosto[];
  anio: number;
  ejecutado: number;
  proyeccion: number;
}

export function CostosReporte({ filtros, onFiltros, filas, anio, ejecutado, proyeccion }: Props) {
  const costoTotal = filas.reduce((acc, f) => acc + f.costoMayor, 0);

  return (
    <SectionCard titulo="Reporte de Costos">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <FiltroContratoSelect valor={filtros.contrato} onChange={(contrato) => onFiltros({ ...filtros, contrato })} />
        <FiltroCoordinacionSelect valor={filtros.coordinacion} onChange={(coordinacion) => onFiltros({ ...filtros, coordinacion })} />
        <div className="ml-auto">
          <SearchInput value={filtros.busqueda} onChange={(busqueda) => onFiltros({ ...filtros, busqueda })} placeholder="Buscar ítem o código" />
        </div>
      </div>

      {filas.length === 0 ? (
        <EmptyState mensaje="No hay ítems que coincidan con los filtros." />
      ) : (
        <div className="max-h-96 overflow-auto rounded-input">
          <table className="table-base">
            <thead>
              <tr>
                <th>Ítem</th>
                <th>Contrato</th>
                <th>Coordinación</th>
                <th className="text-center">Cant.</th>
                <th className="text-right">Costo/Unidad</th>
                <th className="text-right" title="Costo unitario × cantidad">Costo/Mayor</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.id}>
                  <td>
                    <p className="font-semibold">{f.item}</p>
                    <p className="text-xs text-gray-500">{f.codigo}</p>
                  </td>
                  <td><ContratoBadge categoria={f.categoria} /></td>
                  <td>{COORDINACION_LABEL[f.coordinacion]}</td>
                  <td className="text-center">{f.cantidad}</td>
                  <td className="text-right">{formatCOP(f.costoUnidad)}</td>
                  <td className="text-right font-semibold">{formatCOP(f.costoMayor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <MetricCard etiqueta="Total de ítems mostrados" valor={filas.length} />
        <MetricCard etiqueta="Costo total de ítems" valor={<span className="text-2xl">{formatCOP(costoTotal)}</span>} />
        <MetricCard etiqueta={`Proyección anual ${anio}`} valor={<span className="text-2xl">{formatCOP(proyeccion)}</span>}>
          <p className="font-data text-xs text-gray-600">
            Ejecutado {formatCOP(ejecutado)} en solicitudes aceptadas, extrapolado a 12 meses.
          </p>
        </MetricCard>
      </div>
    </SectionCard>
  );
}
