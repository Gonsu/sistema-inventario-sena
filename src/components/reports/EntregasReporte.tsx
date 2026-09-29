import { CheckCircle2, Clock } from 'lucide-react';
import type { EstadoEntrega, FilaEntrega, FiltrosEntregas } from '../../services/reportes';
import { formatFecha } from '../../utils/format';
import { COORDINACION_LABEL } from '../../utils/labels';
import { EmptyState, SectionCard } from '../ui/Primitives';
import { ContratoBadge, FiltroContratoSelect, FiltroCoordinacionSelect } from './Controles';

interface Props {
  filtros: FiltrosEntregas;
  onFiltros: (f: FiltrosEntregas) => void;
  /** Filas sin filtro de estado, para los conteos superiores. */
  todas: FilaEntrega[];
  filas: FilaEntrega[];
}

const ESTADOS: Array<{ valor: EstadoEntrega | ''; label: string }> = [
  { valor: '', label: 'Todos' },
  { valor: 'entregado', label: 'Entregado' },
  { valor: 'pendiente', label: 'Pendiente' },
];

export function EstadoEntregaTag({ estado }: { estado: EstadoEntrega }) {
  return estado === 'entregado' ? (
    <span className="inline-flex items-center gap-1 font-semibold text-green-700"><CheckCircle2 className="h-4 w-4" aria-hidden /> Entregado</span>
  ) : (
    <span className="inline-flex items-center gap-1 font-semibold text-red-600"><Clock className="h-4 w-4" aria-hidden /> Pendiente</span>
  );
}

export function EntregasReporte({ filtros, onFiltros, todas, filas }: Props) {
  const entregados = todas.filter((f) => f.estado === 'entregado').length;
  const pendientes = todas.length - entregados;

  return (
    <SectionCard
      titulo="Estado de Entregas de Productos"
      acciones={
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 font-title text-sm font-bold text-white">
            <CheckCircle2 className="h-4 w-4" aria-hidden /> {entregados} Entregados
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 font-title text-sm font-bold text-white">
            <Clock className="h-4 w-4" aria-hidden /> {pendientes} Pendientes
          </span>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <FiltroContratoSelect valor={filtros.contrato} onChange={(contrato) => onFiltros({ ...filtros, contrato })} />
        <FiltroCoordinacionSelect valor={filtros.coordinacion} onChange={(coordinacion) => onFiltros({ ...filtros, coordinacion })} />
        <div>
          <span className="label">Estado</span>
          <div className="flex overflow-hidden rounded-input border border-sena-primary" role="group" aria-label="Filtrar por estado">
            {ESTADOS.map((e) => (
              <button
                key={e.label}
                type="button"
                aria-pressed={filtros.estado === e.valor}
                onClick={() => onFiltros({ ...filtros, estado: e.valor })}
                className={`px-4 py-2 font-title text-sm font-semibold ${filtros.estado === e.valor ? 'bg-sena-primary text-white' : 'bg-white text-sena-primary hover:bg-sena-card'}`}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filas.length === 0 ? (
        <EmptyState mensaje="No hay productos que coincidan con los filtros." />
      ) : (
        <div className="max-h-96 overflow-auto rounded-input">
          <table className="table-base">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Contrato</th>
                <th>Coordinación</th>
                <th className="text-center">Cant.</th>
                <th>Estado</th>
                <th>Fecha entrega</th>
                <th>Instructor</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.id}>
                  <td className="whitespace-nowrap">{f.codigo}</td>
                  <td>
                    <p>{f.nombre}</p>
                    <p className="text-xs text-gray-500">{f.solicitud}</p>
                  </td>
                  <td><ContratoBadge categoria={f.categoria} /></td>
                  <td>{COORDINACION_LABEL[f.coordinacion]}</td>
                  <td className="text-center">{f.cantidad}</td>
                  <td className="whitespace-nowrap"><EstadoEntregaTag estado={f.estado} /></td>
                  <td className="whitespace-nowrap text-xs">{f.fechaEntrega ? formatFecha(f.fechaEntrega) : '—'}</td>
                  <td>{f.instructor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}
