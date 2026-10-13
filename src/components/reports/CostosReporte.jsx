// Importar funciones de formato (pesos, fechas) y búsqueda
import { formatCOP } from '../../utils/format';

// Importar los textos que se muestran para cada valor
import { COORDINACION_LABEL } from '../../utils/labels';

// Importar componentes visuales reutilizables
import EmptyState from '../ui/EmptyState';
import MetricCard from '../ui/MetricCard';
import SearchInput from '../ui/SearchInput';
import SectionCard from '../ui/SectionCard';

// Importar componentes de esta misma sección
import ContratoBadge from './ContratoBadge';
import FiltroContratoSelect from './FiltroContratoSelect';
import FiltroCoordinacionSelect from './FiltroCoordinacionSelect';

// Reporte de costos: lista de materiales con su costo, filtros y tarjetas de totales.
// Los datos ya llegan calculados desde la vista Reportes.
function CostosReporte({ filtros, onFiltros, filas, anio, ejecutado, proyeccion }) {
  // Suma del costo de todos los materiales mostrados
  const costoTotal = filas.reduce((acc, f) => acc + f.costoMayor, 0);

  // Todo componente de React debe retornar un solo contenedor padre
  return (
    <SectionCard titulo="Reporte de Costos">
      {/* Filtros */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <FiltroContratoSelect
          valor={filtros.contrato}
          onChange={(contrato) => onFiltros({ ...filtros, contrato })}
        />
        <FiltroCoordinacionSelect
          valor={filtros.coordinacion}
          onChange={(coordinacion) => onFiltros({ ...filtros, coordinacion })}
        />
        <div className="ml-auto">
          <SearchInput
            value={filtros.busqueda}
            onChange={(busqueda) => onFiltros({ ...filtros, busqueda })}
            placeholder="Buscar ítem o código"
          />
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
                <th className="text-right" title="Costo unitario × cantidad">
                  Costo/Mayor
                </th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.id}>
                  <td>
                    <p className="font-semibold">{f.item}</p>
                    <p className="text-xs text-gray-500">{f.codigo}</p>
                  </td>
                  <td>
                    <ContratoBadge categoria={f.categoria} />
                  </td>
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

      {/* Tarjetas de totales */}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <MetricCard etiqueta="Total de ítems mostrados" valor={filas.length} />
        <MetricCard
          etiqueta="Costo total de ítems"
          valor={<span className="text-2xl">{formatCOP(costoTotal)}</span>}
        />
        <MetricCard
          etiqueta={`Proyección anual ${anio}`}
          valor={<span className="text-2xl">{formatCOP(proyeccion)}</span>}
        >
          <p className="font-data text-xs text-gray-600">
            Ejecutado {formatCOP(ejecutado)} en solicitudes aceptadas, extrapolado a 12 meses.
          </p>
        </MetricCard>
      </div>
    </SectionCard>
  );
}

export default CostosReporte;
