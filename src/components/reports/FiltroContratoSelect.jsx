// Importar los nombres de los contratos
import { CONTRATO_LABEL } from '../../utils/labels';

// Importar el select genérico
import FiltroSelect from './FiltroSelect';

// Filtro ya configurado para elegir un contrato (Electrónica, Mobiliario, Herramientas)
function FiltroContratoSelect({ valor, onChange }) {
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

export default FiltroContratoSelect;
