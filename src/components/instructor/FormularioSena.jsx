// Importar funciones de formato (pesos, fechas) y búsqueda
import { formatCOP } from '../../utils/format';

// Importar los textos que se muestran para cada valor
import { TIPO_FORMACION_LABEL } from '../../utils/labels';

// Importar componentes visuales reutilizables
import FormatoEncabezado from '../ui/FormatoEncabezado';

// Importar componentes de esta misma sección
import PdfDropzone from './PdfDropzone';

// Paso 2 de la solicitud: formato oficial SENA.
// El instructor llena sus datos, revisa los materiales elegidos y adjunta el PDF firmado.
function FormularioSena({
  numero,
  fecha,
  formulario,
  onFormulario,
  lineas,
  total,
  pdf,
  onPdf,
  onError,
}) {
  // Cambia un campo del formulario sin perder los demás
  const set = (campo, valor) => onFormulario({ ...formulario, [campo]: valor });

  // Todo componente de React debe retornar un solo contenedor padre
  return (
    <div className="space-y-4">
      {/* Encabezado oficial del formato */}
      <FormatoEncabezado numero={numero} fecha={fecha} />

      {/* Datos del instructor y de la formación */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="sol-nombre">
            Nombre
          </label>
          <input
            id="sol-nombre"
            className="input"
            value={formulario.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            maxLength={60}
          />
        </div>
        <div>
          <label className="label" htmlFor="sol-apellido">
            Apellido
          </label>
          <input
            id="sol-apellido"
            className="input"
            value={formulario.apellido}
            onChange={(e) => set('apellido', e.target.value)}
            maxLength={60}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="sol-programa">
            Programa de formación
          </label>
          <input
            id="sol-programa"
            className="input"
            value={formulario.programa}
            onChange={(e) => set('programa', e.target.value)}
            maxLength={120}
            placeholder="Ej. Análisis y Desarrollo de Software"
          />
        </div>
        <div className="sm:col-span-2">
          {/* Botones para elegir el tipo de formación */}
          <span className="label">Tipo de formación</span>
          <div className="flex gap-2" role="radiogroup" aria-label="Tipo de formación">
            {Object.keys(TIPO_FORMACION_LABEL).map((t) => {
              const activo = formulario.tipoFormacion === t;
              return (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={activo}
                  onClick={() => set('tipoFormacion', t)}
                  className={`btn flex-1 border ${activo ? 'border-sena-header bg-sena-header text-white' : 'border-sena-card-border bg-white text-sena-header hover:border-sena-header'}`}
                >
                  {TIPO_FORMACION_LABEL[t]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resumen de los materiales elegidos en el paso 1 */}
      <div className="overflow-auto rounded-input">
        <table className="table-base">
          <thead>
            <tr>
              <th>Código</th>
              <th>Material</th>
              <th className="text-center">Cantidad</th>
              <th className="text-right">Valor unitario</th>
              <th className="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {lineas.map(({ item, cantidad }) => (
              <tr key={item.id}>
                <td>{item.codigo}</td>
                <td>{item.nombre}</td>
                <td className="text-center">{cantidad}</td>
                <td className="text-right">{formatCOP(item.valorUnitario)}</td>
                <td className="text-right">{formatCOP(item.valorUnitario * cantidad)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-white font-title font-bold text-sena-header">
              <td colSpan={4} className="px-3 py-2 text-right">
                VALOR TOTAL
              </td>
              <td className="px-3 py-2 text-right">{formatCOP(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div>
        {/* Adjuntar el formato firmado (obligatorio) */}
        <span className="label">Formato firmado (PDF) *</span>
        <PdfDropzone archivo={pdf} onArchivo={onPdf} onError={onError} />
      </div>
    </div>
  );
}

export default FormularioSena;
