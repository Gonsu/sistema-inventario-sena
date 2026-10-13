// Lista desplegable genérica para filtrar reportes.
// Recibe:
//  - etiqueta: texto que va encima del select
//  - valor: opción seleccionada actualmente
//  - opciones: objeto { valor: 'Texto visible' }
//  - textoTodos: texto de la primera opción (sin filtro)
function FiltroSelect({ etiqueta, valor, opciones, textoTodos, onChange }) {
  return (
    <label className="flex min-w-44 flex-col">
      <span className="label">{etiqueta}</span>
      <select className="input" value={valor} onChange={(e) => onChange(e.target.value)}>
        {/* Opción vacía = mostrar todos los registros */}
        <option value="">{textoTodos}</option>
        {/* Recorrer el objeto de opciones y crear un <option> por cada una */}
        {Object.entries(opciones).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}

export default FiltroSelect;
