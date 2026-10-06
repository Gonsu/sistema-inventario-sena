import { useMemo, useState } from 'react';
import { coincide, formatCOP } from '../../utils/format';
import { Badge, SearchInput } from '../ui/Primitives';

// itemId -> cantidad

/** Fase 1: tabla con los ítems de los tres contratos. */
export function SeleccionMateriales({ items, contratos, seleccion, onCambiar }) {
  const [busqueda, setBusqueda] = useState('');
  const [contratoFiltro, setContratoFiltro] = useState('');
  const nombreContrato = useMemo(
    () => new Map(contratos.map((c) => [c.id, c.nombre])),
    [contratos],
  );

  const visibles = items.filter(
    (i) =>
      (!contratoFiltro || i.contratoId === contratoFiltro) &&
      coincide(busqueda, i.nombre, i.codigo),
  );

  const toggle = (item) => {
    const next = { ...seleccion };
    if (item.id in next) delete next[item.id];
    else next[item.id] = 1;
    onCambiar(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar material" />
        <select
          className="input w-auto"
          value={contratoFiltro}
          onChange={(e) => setContratoFiltro(e.target.value)}
          aria-label="Filtrar por contrato"
        >
          <option value="">Todos los contratos</option>
          {contratos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="max-h-[45vh] overflow-auto rounded-input">
        <table className="table-base">
          <thead>
            <tr>
              <th className="w-10" />
              <th>Material</th>
              <th>Contrato</th>
              <th className="text-right">Valor unitario</th>
              <th className="text-center">Disponibles</th>
              <th className="w-28">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((item) => {
              const marcado = item.id in seleccion;
              const agotado = item.cantidadDisponible === 0;
              return (
                <tr key={item.id} className={agotado ? 'opacity-50' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-sena-primary"
                      checked={marcado}
                      disabled={agotado && !marcado}
                      onChange={() => toggle(item)}
                      aria-label={`Seleccionar ${item.nombre}`}
                    />
                  </td>
                  <td>
                    <p className="font-semibold">{item.nombre}</p>
                    <p className="text-xs text-gray-500">{item.codigo}</p>
                  </td>
                  <td>
                    <Badge tono="gris">{nombreContrato.get(item.contratoId) ?? '—'}</Badge>
                  </td>
                  <td className="text-right">{formatCOP(item.valorUnitario)}</td>
                  <td className="text-center">
                    {agotado ? <Badge tono="rojo">Agotado</Badge> : item.cantidadDisponible}
                  </td>
                  <td>
                    {marcado && (
                      <input
                        type="number"
                        className="input"
                        min={1}
                        max={item.cantidadDisponible}
                        value={seleccion[item.id]}
                        onChange={(e) => {
                          const v = Math.max(
                            1,
                            Math.min(
                              item.cantidadDisponible,
                              Math.floor(Number(e.target.value) || 1),
                            ),
                          );
                          onCambiar({ ...seleccion, [item.id]: v });
                        }}
                        aria-label={`Cantidad de ${item.nombre}`}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
