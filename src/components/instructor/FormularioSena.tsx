import type { ArchivoAdjunto, ItemContrato, SolicitudFormulario, TipoFormacion } from '../../types';
import { formatCOP } from '../../utils/format';
import { TIPO_FORMACION_LABEL } from '../../utils/labels';
import { FormatoEncabezado } from '../ui/FormatoEncabezado';
import { PdfDropzone } from './PdfDropzone';

interface Props {
  numero: string;
  fecha: string;
  formulario: SolicitudFormulario;
  onFormulario: (f: SolicitudFormulario) => void;
  lineas: Array<{ item: ItemContrato; cantidad: number }>;
  total: number;
  pdf: ArchivoAdjunto | null;
  onPdf: (a: ArchivoAdjunto | null) => void;
  onError: (mensaje: string | null) => void;
}

/** Fase 2: formato oficial SENA. */
export function FormularioSena({ numero, fecha, formulario, onFormulario, lineas, total, pdf, onPdf, onError }: Props) {
  const set = <K extends keyof SolicitudFormulario>(campo: K, valor: SolicitudFormulario[K]) => onFormulario({ ...formulario, [campo]: valor });

  return (
    <div className="space-y-4">
      <FormatoEncabezado numero={numero} fecha={fecha} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="sol-nombre">Nombre</label>
          <input id="sol-nombre" className="input" value={formulario.nombre} onChange={(e) => set('nombre', e.target.value)} maxLength={60} />
        </div>
        <div>
          <label className="label" htmlFor="sol-apellido">Apellido</label>
          <input id="sol-apellido" className="input" value={formulario.apellido} onChange={(e) => set('apellido', e.target.value)} maxLength={60} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="sol-programa">Programa de formación</label>
          <input id="sol-programa" className="input" value={formulario.programa} onChange={(e) => set('programa', e.target.value)} maxLength={120} placeholder="Ej. Análisis y Desarrollo de Software" />
        </div>
        <div className="sm:col-span-2">
          <span className="label">Tipo de formación</span>
          <div className="flex gap-2" role="radiogroup" aria-label="Tipo de formación">
            {(Object.keys(TIPO_FORMACION_LABEL) as TipoFormacion[]).map((t) => {
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
              <td colSpan={4} className="px-3 py-2 text-right">VALOR TOTAL</td>
              <td className="px-3 py-2 text-right">{formatCOP(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div>
        <span className="label">Formato firmado (PDF) *</span>
        <PdfDropzone archivo={pdf} onArchivo={onPdf} onError={onError} />
      </div>
    </div>
  );
}
