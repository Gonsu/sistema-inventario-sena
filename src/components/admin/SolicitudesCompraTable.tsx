import { useMemo, useState } from 'react';
import type { Solicitud, SolicitudEstado } from '../../types';
import { descargarDataURL } from '../../utils/files';
import { coincide, formatCOP, formatFecha } from '../../utils/format';
import { ESTADO_SOLICITUD_LABEL } from '../../utils/labels';
import { Badge, EmptyState, SearchInput } from '../ui/Primitives';

const TONO_ESTADO = { pendiente: 'amarillo', aprobada: 'verde', rechazada: 'rojo', cancelada: 'gris' } as const;

/** Registro completo de solicitudes (todas las etapas) con acceso a los PDF enviados. */
export function SolicitudesCompraTable({ solicitudes, onVer }: { solicitudes: Solicitud[]; onVer: (s: Solicitud) => void }) {
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState<SolicitudEstado | ''>('');

  const filtradas = useMemo(
    () =>
      solicitudes
        .filter((s) => (!estado || s.estado === estado) && coincide(busqueda, s.numero, s.formulario.nombre, s.formulario.apellido, s.formulario.programa))
        .sort((a, b) => b.creadaEn.localeCompare(a.creadaEn)),
    [solicitudes, estado, busqueda],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg">Solicitudes de Compra</h3>
        <div className="flex flex-wrap gap-2">
          <SearchInput value={busqueda} onChange={setBusqueda} placeholder="N°, instructor o programa" />
          <select className="input w-auto" value={estado} onChange={(e) => setEstado(e.target.value as SolicitudEstado | '')} aria-label="Filtrar por estado">
            <option value="">Todos los estados</option>
            {Object.entries(ESTADO_SOLICITUD_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>
      {filtradas.length === 0 ? (
        <EmptyState mensaje="No hay solicitudes que coincidan." />
      ) : (
        <div className="max-h-96 overflow-auto rounded-input">
          <table className="table-base">
            <thead>
              <tr>
                <th>N°</th>
                <th>Instructor</th>
                <th>Fecha</th>
                <th className="text-right">Valor</th>
                <th>Estado</th>
                <th>Formato</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtradas.map((s) => (
                <tr key={s.id}>
                  <td className="whitespace-nowrap font-semibold">{s.numero}</td>
                  <td>{s.formulario.nombre} {s.formulario.apellido}</td>
                  <td className="whitespace-nowrap text-xs">{formatFecha(s.creadaEn)}</td>
                  <td className="text-right">{formatCOP(s.valorTotal)}</td>
                  <td><Badge tono={TONO_ESTADO[s.estado]}>{ESTADO_SOLICITUD_LABEL[s.estado]}</Badge></td>
                  <td>
                    <button className="font-data text-xs font-semibold text-sena-primary hover:underline" onClick={() => descargarDataURL(s.formatoPdf.data, s.formatoPdf.nombre)}>
                      📄 {s.formatoPdf.nombre}
                    </button>
                  </td>
                  <td><button className="btn-outline px-3 py-1" onClick={() => onVer(s)}>Ver</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
