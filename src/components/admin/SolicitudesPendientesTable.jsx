import { useMemo, useState } from 'react';
import { PRESUPUESTO_MAX_SOLICITUD } from '../../utils/constants';
import { coincide, formatCOP, formatFecha } from '../../utils/format';
import { TIPO_FORMACION_LABEL } from '../../utils/labels';
import { Badge, EmptyState, SearchInput, SectionCard } from '../ui/Primitives';

export function SolicitudesPendientesTable({ pendientes, onVer, onAceptar }) {
  const [busqueda, setBusqueda] = useState('');
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
