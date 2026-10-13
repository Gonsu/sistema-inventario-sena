// Importar el formato de fecha
import { formatFecha } from '../../utils/format';

// Importar el logo
import SenaLogo from './SenaLogo';

// Encabezado del formato oficial de solicitud.
// Lo usan tanto el instructor (al llenar la solicitud) como la administración (al revisarla).
function FormatoEncabezado({ numero, fecha }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-input bg-sena-header px-4 py-3 text-white">
      {/* Logo y nombre de la entidad */}
      <div className="flex items-center gap-3">
        <SenaLogo className="h-12 w-12" />
        <div>
          <p className="font-title text-base font-extrabold tracking-wide">
            SERVICIO NACIONAL DE APRENDIZAJE
          </p>
          <p className="font-data text-xs text-white/80">
            Formato de Solicitud de Materiales de Formación
          </p>
        </div>
      </div>
      {/* Fecha y número de la solicitud */}
      <div className="text-right font-data text-sm">
        <p>
          <span className="text-white/70">Fecha:</span> {formatFecha(fecha, false)}
        </p>
        <p>
          <span className="text-white/70">N° solicitud:</span>{' '}
          <span className="font-bold">{numero}</span>
        </p>
      </div>
    </div>
  );
}

export default FormatoEncabezado;
