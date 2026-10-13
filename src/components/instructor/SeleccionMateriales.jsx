// Importar herramientas básicas de React
import { useMemo, useState } from 'react';

// Importar funciones de formato (pesos, fechas) y búsqueda
import { coincide, formatCOP } from '../../utils/format';

// Importar componentes visuales reutilizables
import Badge from '../ui/Badge';
import SearchInput from '../ui/SearchInput';

// Paso 1 de la solicitud: tabla con los materiales de los tres contratos.
// Recibe:
//  - seleccion: objeto { idDelMaterial: cantidad } con lo que se ha elegido
//  - onCambiar: se llama con la nueva selección cada vez que cambia
function SeleccionMateriales({ items, contratos, seleccion, onCambiar }) {
  // Filtros: texto del buscador y contrato elegido
  const [busqueda, setBusqueda] = useState('');
  const [contratoFiltro, setContratoFiltro] = useState('');
  // Índice para mostrar el nombre del contrato de cada material
  const nombreContrato = useMemo(
    () => new Map(contratos.map((c) => [c.id, c.nombre])),
    [contratos],
  );

  // Materiales que cumplen los filtros
  const visibles = items.filter(
    (i) =>
      (!contratoFiltro || i.contratoId === contratoFiltro) &&
      coincide(busqueda, i.nombre, i.codigo),
  );

  // Marcar o desmarcar un material (al marcarlo empieza con 1 unidad)
  const toggle = (item) => {
    const next = { ...seleccion };
    if (item.id in next) delete next[item.id];
    else next[item.id] = 1;
    onCambiar(next);
  };

  // Todo componente de React debe retornar un solo contenedor padre
  return (
    <div className="space-y-3">
      {/* Buscador y filtro por contrato */}
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
      {/* Tabla de materiales disponibles */}
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
              // ¿Está seleccionado? ¿Se acabó en bodega?
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
                    {/* La cantidad solo se puede escribir si el material está marcado */}
                    {marcado && (
                      <input
                        type="number"
                        className="input"
                        min={1}
                        max={item.cantidadDisponible}
                        value={seleccion[item.id]}
                        onChange={(e) => {
                          // La cantidad debe estar entre 1 y lo que hay disponible
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

export default SeleccionMateriales;
