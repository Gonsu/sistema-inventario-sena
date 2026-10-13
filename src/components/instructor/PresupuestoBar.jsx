// Importar constantes del sistema
import { PRESUPUESTO_MAX_SOLICITUD } from '../../utils/constants';

// Importar funciones de formato (pesos, fechas) y búsqueda
import { formatCOP } from '../../utils/format';

// Barra que muestra cuánto del presupuesto máximo ($3.000.000) se ha usado en la solicitud.
// Se pone roja si el total se pasa del tope.
function PresupuestoBar({ total }) {
  // ¿Se pasó del tope? y porcentaje de la barra (máximo 100 %)
  const excedido = total > PRESUPUESTO_MAX_SOLICITUD;
  const porcentaje = Math.min(100, (total / PRESUPUESTO_MAX_SOLICITUD) * 100);
  // Todo componente de React debe retornar un solo contenedor padre
  return (
    <div className="rounded-input bg-white p-3">
      {/* Texto: total usado / tope */}
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
      {/* Aviso cuando se pasa del tope */}
      {excedido && (
        <p className="mt-1 font-data text-xs font-semibold text-red-600">
          Excedes el presupuesto máximo en {formatCOP(total - PRESUPUESTO_MAX_SOLICITUD)}.
        </p>
      )}
    </div>
  );
}

export default PresupuestoBar;
