import { useEffect, useState } from 'react';
import type { Contrato, ItemContrato } from '../../types';
import { actualizarContrato, type ItemEdicion } from '../../services/inventario';
import { formatCOP } from '../../utils/format';
import { Modal } from '../ui/Modal';
import { Alerta } from '../ui/Primitives';

interface Props {
  contrato: Contrato | null;
  items: ItemContrato[];
  usuarioId: string;
  onCerrar: () => void;
  onExito: (mensaje: string) => void;
}

export function ContratoEditModal({ contrato, items, usuarioId, onCerrar, onExito }: Props) {
  const [numeroContrato, setNumeroContrato] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [ediciones, setEdiciones] = useState<ItemEdicion[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Tomar una copia al abrir: el polling no debe sobrescribir lo que el administrador está editando.
  useEffect(() => {
    if (!contrato) return;
    setNumeroContrato(contrato.numeroContrato);
    setProveedor(contrato.proveedor);
    setFechaFin(contrato.fechaFin.slice(0, 10));
    setEdiciones(
      items
        .filter((i) => i.contratoId === contrato.id)
        .map(({ id, nombre, valorUnitario, cantidadTotal, ubicacion }) => ({ id, nombre, valorUnitario, cantidadTotal, ubicacion })),
    );
    setError(null);
  }, [contrato?.id]);

  const actualizar = (id: string, cambio: Partial<ItemEdicion>) =>
    setEdiciones((prev) => prev.map((e) => (e.id === id ? { ...e, ...cambio } : e)));

  const presupuesto = ediciones.reduce((acc, e) => acc + e.valorUnitario * e.cantidadTotal, 0);

  const guardar = () => {
    if (!contrato) return;
    try {
      const cambios = actualizarContrato(contrato.id, { numeroContrato, proveedor, fechaFin }, ediciones, usuarioId);
      onExito(cambios.length ? `${cambios.length} cambio(s) registrados en el historial.` : 'No hubo cambios que guardar.');
      onCerrar();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const numero = (v: string) => Math.max(0, Math.floor(Number(v) || 0));

  return (
    <Modal
      abierto={!!contrato}
      titulo={`Editar contrato — ${contrato?.nombre ?? ''}`}
      onCerrar={onCerrar}
      ancho="2xl"
      pie={
        <>
          <button className="btn-secondary" onClick={onCerrar}>Cancelar</button>
          <button className="btn-primary" onClick={guardar}>Guardar cambios</button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="ct-numero">N° contrato</label>
            <input id="ct-numero" className="input" value={numeroContrato} onChange={(e) => setNumeroContrato(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="ct-proveedor">Proveedor</label>
            <input id="ct-proveedor" className="input" value={proveedor} onChange={(e) => setProveedor(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="ct-fin">Fecha fin</label>
            <input id="ct-fin" type="date" className="input" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
          </div>
        </div>

        <div className="overflow-auto rounded-input">
          <table className="table-base">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Ubicación</th>
                <th className="w-36">Valor unitario</th>
                <th className="w-24">Cantidad</th>
                <th className="text-center">En uso</th>
                <th className="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {ediciones.map((e) => {
                const original = items.find((i) => i.id === e.id);
                const enUso = original ? original.cantidadTotal - original.cantidadDisponible : 0;
                return (
                  <tr key={e.id}>
                    <td className="whitespace-nowrap">{original?.codigo}</td>
                    <td><input className="input" value={e.nombre} onChange={(ev) => actualizar(e.id, { nombre: ev.target.value })} aria-label="Nombre" /></td>
                    <td><input className="input" value={e.ubicacion} onChange={(ev) => actualizar(e.id, { ubicacion: ev.target.value })} aria-label="Ubicación" /></td>
                    <td><input type="number" min={0} step={1000} className="input" value={e.valorUnitario} onChange={(ev) => actualizar(e.id, { valorUnitario: numero(ev.target.value) })} aria-label="Valor unitario" /></td>
                    <td>
                      <input
                        type="number"
                        min={enUso}
                        className={`input ${e.cantidadTotal < enUso ? 'border-red-500' : ''}`}
                        value={e.cantidadTotal}
                        onChange={(ev) => actualizar(e.id, { cantidadTotal: numero(ev.target.value) })}
                        aria-label="Cantidad"
                      />
                    </td>
                    <td className="text-center">{enUso}</td>
                    <td className="whitespace-nowrap text-right">{formatCOP(e.valorUnitario * e.cantidadTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-4 rounded-input bg-white p-3 font-data">
          <span className="text-sm text-gray-600">Presupuesto actual: {formatCOP(contrato?.presupuesto ?? 0)}</span>
          <span className="font-title text-lg font-bold text-sena-header">Recalculado: {formatCOP(presupuesto)}</span>
        </div>
        {error && <Alerta>{error}</Alerta>}
      </div>
    </Modal>
  );
}
