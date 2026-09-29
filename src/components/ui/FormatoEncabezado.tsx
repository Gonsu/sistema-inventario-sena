import { formatFecha } from '../../utils/format';
import { SenaLogo } from './SenaLogo';

/** Encabezado del formato oficial de solicitud, compartido por instructor y administración. */
export function FormatoEncabezado({ numero, fecha }: { numero: string; fecha: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-input bg-sena-header px-4 py-3 text-white">
      <div className="flex items-center gap-3">
        <SenaLogo className="h-12 w-12" />
        <div>
          <p className="font-title text-base font-extrabold tracking-wide">SERVICIO NACIONAL DE APRENDIZAJE</p>
          <p className="font-data text-xs text-white/80">Formato de Solicitud de Materiales de Formación</p>
        </div>
      </div>
      <div className="text-right font-data text-sm">
        <p><span className="text-white/70">Fecha:</span> {formatFecha(fecha, false)}</p>
        <p><span className="text-white/70">N° solicitud:</span> <span className="font-bold">{numero}</span></p>
      </div>
    </div>
  );
}
