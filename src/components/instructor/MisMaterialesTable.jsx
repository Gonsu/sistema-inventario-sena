// Importar herramientas básicas de React
import { useMemo, useState } from 'react';

// Importar funciones de formato (pesos, fechas) y búsqueda
import { coincide } from '../../utils/format';

// Importar componentes visuales reutilizables
import CantidadBadge from '../ui/CantidadBadge';
import EmptyState from '../ui/EmptyState';
import SearchInput from '../ui/SearchInput';
import SectionCard from '../ui/SectionCard';

// Tabla con los materiales que el instructor tiene asignados en este momento.
// Incluye un buscador por nombre o código.
function MisMaterialesTable({ materiales }) {
  // Texto del buscador
  const [busqueda, setBusqueda] = useState('');
  // Materiales que coinciden con la búsqueda
  const filtrados = useMemo(
    () => materiales.filter((m) => coincide(busqueda, m.nombre, m.codigo)),
    [materiales, busqueda],
  );

  // Todo componente de React debe retornar un solo contenedor padre
  return (
    <SectionCard
      titulo="Mis Materiales Asignados"
      acciones={
        <SearchInput
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar material o código"
        />
      }
    >
      {materiales.length === 0 ? (
        <EmptyState mensaje="No tienes materiales asignados actualmente" />
      ) : filtrados.length === 0 ? (
        <EmptyState mensaje={`Sin resultados para "${busqueda}"`} />
      ) : (
        <div className="max-h-80 overflow-auto rounded-input">
          {/* Tabla de materiales */}
          <table className="table-base">
            <thead>
              <tr>
                <th>Material</th>
                <th>Código</th>
                <th className="text-center">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((m) => (
                <tr key={m.itemId}>
                  <td className="font-semibold">{m.nombre}</td>
                  <td className="text-gray-600">{m.codigo}</td>
                  <td className="text-center">
                    <CantidadBadge valor={m.cantidad} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}

export default MisMaterialesTable;
