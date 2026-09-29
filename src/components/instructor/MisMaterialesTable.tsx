import { useMemo, useState } from 'react';
import type { MaterialAsignado } from '../../hooks/useInventarioData';
import { coincide } from '../../utils/format';
import { CantidadBadge, EmptyState, SearchInput, SectionCard } from '../ui/Primitives';

export function MisMaterialesTable({ materiales }: { materiales: MaterialAsignado[] }) {
  const [busqueda, setBusqueda] = useState('');
  const filtrados = useMemo(
    () => materiales.filter((m) => coincide(busqueda, m.nombre, m.codigo)),
    [materiales, busqueda],
  );

  return (
    <SectionCard titulo="Mis Materiales Asignados" acciones={<SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar material o código" />}>
      {materiales.length === 0 ? (
        <EmptyState mensaje="No tienes materiales asignados actualmente" />
      ) : filtrados.length === 0 ? (
        <EmptyState mensaje={`Sin resultados para "${busqueda}"`} />
      ) : (
        <div className="max-h-80 overflow-auto rounded-input">
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
                  <td className="text-center"><CantidadBadge valor={m.cantidad} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}
