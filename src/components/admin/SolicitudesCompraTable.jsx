// Importar herramientas básicas de React
import { useMemo, useState } from 'react';

// Importar utilidades para manejar archivos e imágenes
import { descargarDataURL } from '../../utils/files';

// Importar funciones de formato (pesos, fechas) y búsqueda
import { coincide, formatCOP, formatFecha } from '../../utils/format';

// Importar los textos que se muestran para cada valor
import { ESTADO_SOLICITUD_LABEL } from '../../utils/labels';

// Importar componentes visuales reutilizables
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import SearchInput from '../ui/SearchInput';

// Color de la etiqueta según el estado de la solicitud
const TONO_ESTADO = {
  pendiente: 'amarillo',
  aprobada: 'verde',
  rechazada: 'rojo',
  cancelada: 'gris',
};

// Registro de todas las solicitudes (en cualquier estado).
// Permite buscarlas, filtrarlas por estado y descargar el PDF que envió el instructor.
function SolicitudesCompraTable({ solicitudes, onVer }) {
  // Filtros: texto del buscador y estado elegido
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');

  // Aplicar los filtros y ordenar de la más reciente a la más antigua
  const filtradas = useMemo(
    () =>
      solicitudes
        .filter(
          (s) =>
            (!estado || s.estado === estado) &&
            coincide(
              busqueda,
              s.numero,
              s.formulario.nombre,
              s.formulario.apellido,
              s.formulario.programa,
            ),
        )
        .sort((a, b) => b.creadaEn.localeCompare(a.creadaEn)),
    [solicitudes, estado, busqueda],
  );

  // Todo componente de React debe retornar un solo contenedor padre
  return (
    <div className="space-y-3">
      {/* Título, buscador y filtro por estado */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg">Solicitudes de Compra</h3>
        <div className="flex flex-wrap gap-2">
          <SearchInput
            value={busqueda}
            onChange={setBusqueda}
            placeholder="N°, instructor o programa"
          />
          <select
            className="input w-auto"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            aria-label="Filtrar por estado"
          >
            <option value="">Todos los estados</option>
            {Object.entries(ESTADO_SOLICITUD_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>
      {filtradas.length === 0 ? (
        <EmptyState mensaje="No hay solicitudes que coincidan." />
      ) : (
        <div className="max-h-96 overflow-auto rounded-input">
          {/* Tabla de solicitudes */}
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
                  <td>
                    {s.formulario.nombre} {s.formulario.apellido}
                  </td>
                  <td className="whitespace-nowrap text-xs">{formatFecha(s.creadaEn)}</td>
                  <td className="text-right">{formatCOP(s.valorTotal)}</td>
                  <td>
                    <Badge tono={TONO_ESTADO[s.estado]}>{ESTADO_SOLICITUD_LABEL[s.estado]}</Badge>
                  </td>
                  <td>
                    <button
                      className="font-data text-xs font-semibold text-sena-primary hover:underline"
                      // Al hacer clic se descarga el PDF adjunto
                      onClick={() => descargarDataURL(s.formatoPdf.data, s.formatoPdf.nombre)}
                    >
                      📄 {s.formatoPdf.nombre}
                    </button>
                  </td>
                  <td>
                    <button className="btn-outline px-3 py-1" onClick={() => onVer(s)}>
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SolicitudesCompraTable;
