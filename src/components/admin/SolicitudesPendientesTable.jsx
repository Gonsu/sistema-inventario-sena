// Importar herramientas básicas de React
import { useMemo, useState } from 'react';

// Importar constantes del sistema
import { PRESUPUESTO_MAX_SOLICITUD } from '../../utils/constants';

// Importar funciones de formato (pesos, fechas) y búsqueda
import { coincide, formatCOP, formatFecha } from '../../utils/format';

// Importar los textos que se muestran para cada valor
import { TIPO_FORMACION_LABEL } from '../../utils/labels';

// Importar componentes visuales reutilizables
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import SearchInput from '../ui/SearchInput';
import SectionCard from '../ui/SectionCard';

// Tabla con las solicitudes de materiales que esperan aprobación.
// Recibe:
//  - pendientes: lista de solicitudes en estado "pendiente"
//  - onVer: función para abrir el detalle
//  - onAceptar: función para aceptar la solicitud
function SolicitudesPendientesTable({ pendientes, onVer, onAceptar }) {
  // Texto que el usuario escribe en el buscador
  const [busqueda, setBusqueda] = useState('');
  // Filtrar por nombre, apellido, programa o tipo de formación,
  // y ordenar de la más antigua a la más reciente
  const filtradas = useMemo(
    () =>
      pendientes
        .filter((s) =>
          coincide(
            busqueda,
            s.formulario.nombre,
            s.formulario.apellido,
            s.formulario.programa,
            TIPO_FORMACION_LABEL[s.formulario.tipoFormacion],
          ),
        )
        .sort((a, b) => a.creadaEn.localeCompare(b.creadaEn)),
    [pendientes, busqueda],
  );

  // Todo componente de React debe retornar un solo contenedor padre
  return (
    <SectionCard
      titulo={`Solicitudes de Materiales de Instructores (${pendientes.length})`}
      acciones={
        <SearchInput
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Nombre, apellido o formación"
        />
      }
    >
      {pendientes.length === 0 ? (
        <EmptyState mensaje="No hay solicitudes pendientes." />
      ) : filtradas.length === 0 ? (
        <EmptyState mensaje={`Sin resultados para "${busqueda}"`} />
      ) : (
        <div className="max-h-[28rem] overflow-auto rounded-input">
          {/* Tabla de solicitudes */}
          <table className="table-base">
            <thead>
              <tr>
                <th>N°</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Formación</th>
                <th>Tipo</th>
                <th className="text-right">Presupuesto</th>
                <th className="text-center">PDF</th>
                <th>Fecha</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((s) => {
                // Qué porcentaje del tope por solicitud se usó (si pasa del 90 % la etiqueta sale amarilla)
                const uso = s.valorTotal / PRESUPUESTO_MAX_SOLICITUD;
                return (
                  <tr key={s.id}>
                    <td className="whitespace-nowrap text-xs font-semibold">{s.numero}</td>
                    <td>{s.formulario.nombre}</td>
                    <td>{s.formulario.apellido}</td>
                    <td>{s.formulario.programa}</td>
                    <td>
                      <Badge tono="verdeOscuro">
                        {TIPO_FORMACION_LABEL[s.formulario.tipoFormacion]}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <Badge tono={uso > 0.9 ? 'amarillo' : 'verde'}>
                        {formatCOP(s.valorTotal)}
                      </Badge>
                    </td>
                    {/* ¿Adjuntó el PDF del formato? */}
                    <td className="text-center">
                      {s.formatoPdf ? (
                        <span title={s.formatoPdf.nombre} className="text-lg text-green-700">
                          ✔
                        </span>
                      ) : (
                        <span className="text-lg text-red-600">✘</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap text-xs">{formatFecha(s.creadaEn)}</td>
                    <td>
                      {/* Botones de acción */}
                      <div className="flex justify-center gap-2">
                        <button className="btn-outline px-3 py-1" onClick={() => onVer(s)}>
                          Ver
                        </button>
                        <button className="btn-primary px-3 py-1" onClick={() => onAceptar(s)}>
                          Aceptar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}

export default SolicitudesPendientesTable;
