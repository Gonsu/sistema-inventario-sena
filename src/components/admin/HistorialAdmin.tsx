import { useMemo, useState } from 'react';
import { useCatalogo, useMovimientos, useSolicitudes } from '../../hooks/useInventarioData';
import { coincide, formatCOP, formatFecha } from '../../utils/format';
import { TIPO_FORMACION_LABEL } from '../../utils/labels';
import { Badge, EmptyState, SearchInput, SectionCard } from '../ui/Primitives';

type Pestana = 'materiales' | 'configuraciones';

export function HistorialAdmin() {
  const [pestana, setPestana] = useState<Pestana>('materiales');
  const [busqueda, setBusqueda] = useState('');
  const movimientos = useMovimientos();
  const solicitudes = useSolicitudes();
  const { itemPorId, contratoPorId, nombreUsuario } = useCatalogo();

  const solicitudPorId = useMemo(() => new Map(solicitudes.map((s) => [s.id, s])), [solicitudes]);

  const salidas = useMemo(
    () =>
      movimientos
        .filter((m) => m.tipo === 'asignacion' && m.solicitudId)
        .map((m) => ({ mov: m, sol: solicitudPorId.get(m.solicitudId!) }))
        .filter(({ sol }) => !!sol && coincide(busqueda, sol.numero, sol.formulario.nombre, sol.formulario.apellido, sol.formulario.programa))
        .sort((a, b) => b.mov.fecha.localeCompare(a.mov.fecha)),
    [movimientos, solicitudPorId, busqueda],
  );

  const configuraciones = useMemo(
    () =>
      movimientos
        .filter((m) => m.tipo === 'contrato_actualizado' || m.tipo === 'ajuste_inventario')
        .filter((m) => coincide(busqueda, contratoPorId.get(m.contratoId ?? '')?.nombre, ...(m.cambios ?? [])))
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [movimientos, contratoPorId, busqueda],
  );

  const tab = (id: Pestana, label: string, n: number) => (
    <button
      role="tab"
      aria-selected={pestana === id}
      onClick={() => setPestana(id)}
      className={`rounded-t-input px-4 py-2 font-title text-sm font-semibold ${pestana === id ? 'bg-sena-primary text-white' : 'text-sena-header hover:bg-white/60'}`}
    >
      {label} <span className="ml-1 rounded-full bg-black/10 px-2 text-xs">{n}</span>
    </button>
  );

  return (
    <SectionCard titulo="Historial de Movimientos" acciones={<SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar en el historial" />}>
      <div role="tablist" className="mb-3 flex gap-1 border-b-2 border-sena-primary">
        {tab('materiales', 'Movimientos de Materiales', salidas.length)}
        {tab('configuraciones', 'Configuraciones Inventario', configuraciones.length)}
      </div>

      {pestana === 'materiales' ? (
        salidas.length === 0 ? (
          <EmptyState mensaje="No hay solicitudes aceptadas todavía." />
        ) : (
          <div className="max-h-96 overflow-auto rounded-input">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Solicitud</th>
                  <th>Instructor</th>
                  <th>Formación</th>
                  <th>Materiales</th>
                  <th>Fechas</th>
                  <th className="text-right">Presupuesto</th>
                </tr>
              </thead>
              <tbody>
                {salidas.map(({ mov, sol }) => (
                  <tr key={mov.id}>
                    <td className="whitespace-nowrap font-semibold">{sol!.numero}</td>
                    <td>{sol!.formulario.nombre} {sol!.formulario.apellido}</td>
                    <td>
                      <p>{sol!.formulario.programa}</p>
                      <Badge tono="verdeOscuro">{TIPO_FORMACION_LABEL[sol!.formulario.tipoFormacion]}</Badge>
                    </td>
                    <td>
                      <ul className="text-xs">
                        {(mov.detalle ?? []).map((d) => (
                          <li key={d.itemId}>{itemPorId.get(d.itemId)?.nombre ?? '—'} × {d.cantidad}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="whitespace-nowrap text-xs">
                      <p>Solicitada: {formatFecha(sol!.creadaEn)}</p>
                      <p>Aceptada: {formatFecha(mov.fecha)}</p>
                      <p className="text-gray-500">Por: {nombreUsuario(mov.usuarioId)}</p>
                    </td>
                    <td className="text-right"><Badge>{formatCOP(sol!.valorTotal)}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : configuraciones.length === 0 ? (
        <EmptyState mensaje="Aún no se han editado contratos." />
      ) : (
        <ul className="max-h-96 space-y-2 overflow-y-auto pr-1">
          {configuraciones.map((m) => (
            <li key={m.id} className="rounded-input border-l-4 border-sena-primary bg-white/70 p-3">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-title text-sm font-bold text-sena-header">{m.observacion}</span>
                <span className="font-data text-xs text-gray-500">{formatFecha(m.fecha)} · {nombreUsuario(m.usuarioId)}</span>
              </div>
              <ul className="mt-1 list-inside list-disc font-data text-sm text-gray-700">
                {(m.cambios ?? []).map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
