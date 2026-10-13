// Importar herramientas básicas de React
import { useMemo, useState } from 'react';

// Importar los datos del inventario (se actualizan solos cuando cambian)
import { useCatalogo, useEvidencias } from '../../hooks/useInventarioData';

// Importar utilidades para manejar archivos e imágenes
import { descargarDataURL } from '../../utils/files';

// Importar funciones de formato (pesos, fechas) y búsqueda
import { coincide, formatFecha } from '../../utils/format';

// Importar los textos que se muestran para cada valor
import { EVIDENCIA_TIPO_LABEL } from '../../utils/labels';

// Importar componentes visuales reutilizables
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import SearchInput from '../ui/SearchInput';

// Tabla con las evidencias fotográficas que subieron los instructores.
// Se puede buscar, filtrar por tipo y abrir cada foto en grande.
function EvidenciasAdminTable() {
  // Datos del inventario
  const evidencias = useEvidencias();
  const { itemPorId, nombreUsuario } = useCatalogo();
  // Filtros y evidencia seleccionada para ver en detalle (null = ninguna)
  const [busqueda, setBusqueda] = useState('');
  const [tipo, setTipo] = useState('');
  const [detalle, setDetalle] = useState(null);

  // Aplicar los filtros y ordenar de la más reciente a la más antigua
  const filtradas = useMemo(
    () =>
      evidencias
        .filter(
          (e) =>
            (!tipo || e.tipo === tipo) &&
            coincide(
              busqueda,
              nombreUsuario(e.instructorId),
              itemPorId.get(e.itemId)?.nombre,
              e.descripcion,
            ),
        )
        .sort((a, b) => b.cargadaEn.localeCompare(a.cargadaEn)),
    [evidencias, tipo, busqueda, itemPorId, nombreUsuario],
  );

  // Todo componente de React debe retornar un solo contenedor padre
  return (
    <div className="space-y-3">
      {/* Título, buscador y filtro por tipo */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg">Evidencias Documentales</h3>
        <div className="flex flex-wrap gap-2">
          <SearchInput
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Instructor, material o nota"
          />
          <select
            className="input w-auto"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            aria-label="Filtrar por tipo"
          >
            <option value="">Todos los tipos</option>
            {Object.entries(EVIDENCIA_TIPO_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>
      {filtradas.length === 0 ? (
        <EmptyState mensaje="No hay evidencias que coincidan." />
      ) : (
        <div className="max-h-96 overflow-auto rounded-input">
          {/* Tabla de evidencias */}
          <table className="table-base">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Instructor</th>
                <th>Material</th>
                <th>Tipo</th>
                <th>Fecha</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtradas.map((e) => (
                <tr key={e.id}>
                  <td>
                    <img src={e.archivo} alt="" className="h-10 w-14 rounded object-cover" />
                  </td>
                  <td>{nombreUsuario(e.instructorId)}</td>
                  <td>{itemPorId.get(e.itemId)?.nombre ?? '—'}</td>
                  <td>
                    <Badge>{EVIDENCIA_TIPO_LABEL[e.tipo]}</Badge>
                  </td>
                  <td className="whitespace-nowrap text-xs">{formatFecha(e.cargadaEn)}</td>
                  <td>
                    <button className="btn-outline px-3 py-1" onClick={() => setDetalle(e)}>
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ventana con la foto en grande y sus datos */}
      <Modal
        abierto={!!detalle}
        titulo="Evidencia"
        onCerrar={() => setDetalle(null)}
        pie={
          detalle && (
            <button
              className="btn-primary"
              onClick={() =>
                descargarDataURL(detalle.archivo, detalle.nombreArchivo || 'evidencia.jpg')
              }
            >
              Descargar imagen
            </button>
          )
        }
      >
        {detalle && (
          <div className="space-y-3">
            <img
              src={detalle.archivo}
              alt="Evidencia"
              className="max-h-[50vh] w-full rounded-input bg-white object-contain"
            />
            <div className="font-data text-sm">
              <p>
                <b>Instructor:</b> {nombreUsuario(detalle.instructorId)}
              </p>
              <p>
                <b>Material:</b> {itemPorId.get(detalle.itemId)?.nombre ?? '—'}
              </p>
              <p>
                <b>Tipo:</b> {EVIDENCIA_TIPO_LABEL[detalle.tipo]} · <b>Fecha:</b>{' '}
                {formatFecha(detalle.cargadaEn)}
              </p>
              <p className="mt-2 whitespace-pre-wrap rounded-input bg-white p-3">
                {detalle.descripcion}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default EvidenciasAdminTable;
