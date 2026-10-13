// Importar los colores y nombres de cada contrato
import { CONTRATO_COLOR, CONTRATO_LABEL } from '../../utils/labels';

// Etiqueta de color que identifica a qué contrato pertenece un material
function ContratoBadge({ categoria }) {
  // Sacar los colores que le corresponden a este contrato
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

export default ContratoBadge;
