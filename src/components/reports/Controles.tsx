import type { ContratoCategoria, Coordinacion } from '../../types';
import { CONTRATO_COLOR, CONTRATO_LABEL, COORDINACION_LABEL } from '../../utils/labels';
import type { FiltroContrato, FiltroCoordinacion } from '../../services/reportes';

interface SelectProps<T extends string> {
  etiqueta: string;
  valor: T | '';
  opciones: Record<T, string>;
  textoTodos: string;
  onChange: (v: T | '') => void;
}

export function FiltroSelect<T extends string>({ etiqueta, valor, opciones, textoTodos, onChange }: SelectProps<T>) {
  return (
    <label className="flex min-w-44 flex-col">
      <span className="label">{etiqueta}</span>
      <select className="input" value={valor} onChange={(e) => onChange(e.target.value as T | '')}>
        <option value="">{textoTodos}</option>
        {(Object.entries(opciones) as Array<[T, string]>).map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </label>
  );
}

export function FiltroContratoSelect({ valor, onChange }: { valor: FiltroContrato; onChange: (v: FiltroContrato) => void }) {
  return <FiltroSelect<ContratoCategoria> etiqueta="Contrato" valor={valor} opciones={CONTRATO_LABEL} textoTodos="Todos" onChange={onChange} />;
}

export function FiltroCoordinacionSelect({ valor, onChange }: { valor: FiltroCoordinacion; onChange: (v: FiltroCoordinacion) => void }) {
  return <FiltroSelect<Coordinacion> etiqueta="Coordinación" valor={valor} opciones={COORDINACION_LABEL} textoTodos="Todas" onChange={onChange} />;
}

export function ContratoBadge({ categoria }: { categoria: ContratoCategoria }) {
  const { fondo, texto } = CONTRATO_COLOR[categoria];
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 font-title text-xs font-semibold" style={{ backgroundColor: fondo, color: texto }}>
      {CONTRATO_LABEL[categoria]}
    </span>
  );
}
