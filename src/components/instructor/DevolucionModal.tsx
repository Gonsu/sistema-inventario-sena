import { useEffect, useState } from 'react';
import type { MaterialAsignado } from '../../hooks/useInventarioData';
import { devolverMateriales } from '../../services/inventario';
import { Modal } from '../ui/Modal';
import { Alerta, CantidadBadge, EmptyState } from '../ui/Primitives';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  instructorId: string;
  materiales: MaterialAsignado[];
  onExito: (mensaje: string) => void;
}

export function DevolucionModal({ abierto, onCerrar, instructorId, materiales, onExito }: Props) {
  // itemId -> cantidad a devolver (solo presentes los seleccionados)
  const [seleccion, setSeleccion] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (abierto) {
      setSeleccion({});
      setError(null);
    }
  }, [abierto]);

  // Si otra pestaña cambió las asignaciones, recortar la selección a lo que aún se tiene.
  useEffect(() => {
    setSeleccion((prev) => {
      const next: Record<string, number> = {};
      for (const [itemId, cant] of Object.entries(prev)) {
        const m = materiales.find((x) => x.itemId === itemId);
        if (m) next[itemId] = Math.min(cant, m.cantidad);
      }
      return next;
    });
  }, [materiales]);

  const toggle = (m: MaterialAsignado) =>
    setSeleccion((prev) => {
      const next = { ...prev };
      if (m.itemId in next) delete next[m.itemId];
      else next[m.itemId] = m.cantidad;
      return next;
    });

  const seleccionados = Object.entries(seleccion);
  const totalUnidades = seleccionados.reduce((acc, [, c]) => acc + c, 0);

  const confirmar = () => {
    try {
      devolverMateriales(instructorId, seleccionados.map(([itemId, cantidad]) => ({ itemId, cantidad })));
      onExito(`Devolución registrada: ${totalUnidades} unidad(es).`);
      onCerrar();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Modal
      abierto={abierto}
      titulo="Devolver Material"
      onCerrar={onCerrar}
      pie={
        <>
          <button className="btn-secondary" onClick={onCerrar}>Cancelar</button>
          <button className="btn-primary" onClick={confirmar} disabled={totalUnidades === 0}>
            Confirmar devolución ({totalUnidades})
          </button>
        </>
      }
    >
      {materiales.length === 0 ? (
        <EmptyState mensaje="No tienes materiales asignados para devolver." />
      ) : (
        <div className="space-y-3">
          <p className="font-data text-sm text-gray-600">Selecciona los materiales y la cantidad que entregas a bodega.</p>
          <table className="table-base">
            <thead>
              <tr>
                <th className="w-10" />
                <th>Material</th>
                <th className="text-center">Asignado</th>
                <th className="w-32">A devolver</th>
              </tr>
            </thead>
            <tbody>
              {materiales.map((m) => {
                const marcado = m.itemId in seleccion;
                return (
                  <tr key={m.itemId}>
                    <td>
                      <input type="checkbox" className="h-4 w-4 accent-sena-primary" checked={marcado} onChange={() => toggle(m)} aria-label={`Devolver ${m.nombre}`} />
                    </td>
                    <td>
                      <p className="font-semibold">{m.nombre}</p>
                      <p className="text-xs text-gray-500">{m.codigo}</p>
                    </td>
                    <td className="text-center"><CantidadBadge valor={m.cantidad} /></td>
                    <td>
                      {marcado && (
                        <input
                          type="number"
                          className="input"
                          min={1}
                          max={m.cantidad}
                          value={seleccion[m.itemId]}
                          onChange={(e) => {
                            const v = Math.max(1, Math.min(m.cantidad, Math.floor(Number(e.target.value) || 1)));
                            setSeleccion((prev) => ({ ...prev, [m.itemId]: v }));
                          }}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {error && <Alerta>{error}</Alerta>}
        </div>
      )}
    </Modal>
  );
}
