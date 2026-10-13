// Importar herramientas básicas de React
import { useEffect, useState } from 'react';

// Importar las reglas de negocio del inventario
import { devolverMateriales } from '../../services/inventario';

// Importar componentes visuales reutilizables
import Modal from '../ui/Modal';
import Alerta from '../ui/Alerta';
import CantidadBadge from '../ui/CantidadBadge';
import EmptyState from '../ui/EmptyState';

// Ventana para devolver materiales a bodega.
// El instructor marca los materiales y escribe cuántas unidades devuelve.
function DevolucionModal({ abierto, onCerrar, instructorId, materiales, onExito }) {
  // Materiales seleccionados:
  // itemId -> cantidad a devolver (solo presentes los seleccionados)
  const [seleccion, setSeleccion] = useState({});
  // Mensaje de error
  const [error, setError] = useState(null);

  // Cada vez que se abre la ventana, empezar sin nada seleccionado
  useEffect(() => {
    if (abierto) {
      setSeleccion({});
      setError(null);
    }
  }, [abierto]);

  // Mantener la selección al día:
  // Si otra pestaña cambió las asignaciones, recortar la selección a lo que aún se tiene.
  useEffect(() => {
    setSeleccion((prev) => {
      const next = {};
      for (const [itemId, cant] of Object.entries(prev)) {
        const m = materiales.find((x) => x.itemId === itemId);
        if (m) next[itemId] = Math.min(cant, m.cantidad);
      }
      return next;
    });
  }, [materiales]);

  // Marcar o desmarcar un material (al marcarlo se propone devolver todo)
  const toggle = (m) =>
    setSeleccion((prev) => {
      const next = { ...prev };
      if (m.itemId in next) delete next[m.itemId];
      else next[m.itemId] = m.cantidad;
      return next;
    });

  // Lista de seleccionados y total de unidades a devolver
  const seleccionados = Object.entries(seleccion);
  const totalUnidades = seleccionados.reduce((acc, [, c]) => acc + c, 0);

  // Registrar la devolución y cerrar la ventana
  const confirmar = () => {
    try {
      devolverMateriales(
        instructorId,
        seleccionados.map(([itemId, cantidad]) => ({ itemId, cantidad })),
      );
      onExito(`Devolución registrada: ${totalUnidades} unidad(es).`);
      onCerrar();
      // Si algo falla, mostrar el error
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Modal
      abierto={abierto}
      titulo="Devolver Material"
      onCerrar={onCerrar}
      // Botones de la parte de abajo
      pie={
        <>
          <button className="btn-secondary" onClick={onCerrar}>
            Cancelar
          </button>
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
          <p className="font-data text-sm text-gray-600">
            Selecciona los materiales y la cantidad que entregas a bodega.
          </p>
          {/* Tabla de materiales para seleccionar */}
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
                // ¿Este material está seleccionado?
                const marcado = m.itemId in seleccion;
                return (
                  <tr key={m.itemId}>
                    <td>
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-sena-primary"
                        checked={marcado}
                        onChange={() => toggle(m)}
                        aria-label={`Devolver ${m.nombre}`}
                      />
                    </td>
                    <td>
                      <p className="font-semibold">{m.nombre}</p>
                      <p className="text-xs text-gray-500">{m.codigo}</p>
                    </td>
                    <td className="text-center">
                      <CantidadBadge valor={m.cantidad} />
                    </td>
                    <td>
                      {/* La cantidad solo se puede escribir si el material está marcado */}
                      {marcado && (
                        <input
                          type="number"
                          className="input"
                          min={1}
                          max={m.cantidad}
                          value={seleccion[m.itemId]}
                          onChange={(e) => {
                            // La cantidad debe estar entre 1 y lo que tiene asignado
                            const v = Math.max(
                              1,
                              Math.min(m.cantidad, Math.floor(Number(e.target.value) || 1)),
                            );
                            setSeleccion((prev) => ({
                              ...prev,
                              [m.itemId]: v,
                            }));
                          }}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Mensaje de error */}
          {error && <Alerta>{error}</Alerta>}
        </div>
      )}
    </Modal>
  );
}

export default DevolucionModal;
