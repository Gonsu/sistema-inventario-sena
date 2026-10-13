// Importar los nombres de las coordinaciones
import { COORDINACION_LABEL } from '../../utils/labels';

// Importar el select genérico
import FiltroSelect from './FiltroSelect';

// Filtro ya configurado para elegir una coordinación académica
function FiltroCoordinacionSelect({ valor, onChange }) {
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

export default FiltroCoordinacionSelect;
