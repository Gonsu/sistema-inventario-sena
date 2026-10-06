import { PRESUPUESTO_MAX_SOLICITUD } from '../../utils/constants';
import { formatCOP } from '../../utils/format';

export function PresupuestoBar({ total }) {
  const excedido = total > PRESUPUESTO_MAX_SOLICITUD;
  const porcentaje = Math.min(100, (total / PRESUPUESTO_MAX_SOLICITUD) * 100);
  return (
    <div className="rounded-input bg-white p-3">
      <div className="mb-1 flex flex-wrap justify-between gap-2 font-data text-sm">
        <span className="font-title font-semibold text-sena-header">
          Presupuesto de la solicitud
        </span>
        <span className={excedido ? 'font-bold text-red-600' : 'text-gray-700'}>
          {formatCOP(total)} / {formatCOP(PRESUPUESTO_MAX_SOLICITUD)}
        </span>
      </div>
      <div
        className="h-3 overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={PRESUPUESTO_MAX_SOLICITUD}
        aria-valuenow={total}
      >
        <div
          className={`h-full rounded-full transition-all ${excedido ? 'bg-red-600' : 'bg-sena-primary'}`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
      {excedido && (
        <p className="mt-1 font-data text-xs font-semibold text-red-600">
          Excedes el presupuesto máximo en {formatCOP(total - PRESUPUESTO_MAX_SOLICITUD)}.
        </p>
      )}
    </div>
  );
}
