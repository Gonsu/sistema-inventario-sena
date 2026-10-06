import { CONTRATO_COLOR, CONTRATO_LABEL, COORDINACION_LABEL } from '../../utils/labels';

export function FiltroSelect({ etiqueta, valor, opciones, textoTodos, onChange }) {
  return (
    <label className="flex min-w-44 flex-col">
      <span className="label">{etiqueta}</span>
      <select className="input" value={valor} onChange={(e) => onChange(e.target.value)}>
        <option value="">{textoTodos}</option>
        {Object.entries(opciones).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FiltroContratoSelect({ valor, onChange }) {
  return (
    <FiltroSelect
      etiqueta="Contrato"
      valor={valor}
      opciones={CONTRATO_LABEL}
      textoTodos="Todos"
      onChange={onChange}
    />
  );
}

export function FiltroCoordinacionSelect({ valor, onChange }) {
  return (
    <FiltroSelect
      etiqueta="Coordinación"
      valor={valor}
      opciones={COORDINACION_LABEL}
      textoTodos="Todas"
      onChange={onChange}
    />
  );
}

export function ContratoBadge({ categoria }) {
  const { fondo, texto } = CONTRATO_COLOR[categoria];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 font-title text-xs font-semibold"
      style={{ backgroundColor: fondo, color: texto }}
    >
      {CONTRATO_LABEL[categoria]}
    </span>
  );
}
