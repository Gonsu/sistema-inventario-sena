import { useRef, useState } from 'react';
import type { ArchivoAdjunto } from '../../types';
import { formatBytes } from '../../utils/format';
import { leerAdjunto, MAX_PDF_BYTES } from '../../utils/files';

interface Props {
  archivo: ArchivoAdjunto | null;
  onArchivo: (a: ArchivoAdjunto | null) => void;
  onError: (mensaje: string | null) => void;
}

export function PdfDropzone({ archivo, onArchivo, onError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);

  const procesar = async (file: File | undefined) => {
    onError(null);
    if (!file) return;
    if (file.type !== 'application/pdf') return onError('El formato debe ser un archivo PDF.');
    if (file.size > MAX_PDF_BYTES) return onError(`El PDF supera el límite de ${formatBytes(MAX_PDF_BYTES)}.`);
    try {
      onArchivo(await leerAdjunto(file));
    } catch (e) {
      onError((e as Error).message);
    }
  };

  if (archivo) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-input border border-sena-primary bg-green-50 p-3">
        <div className="flex items-center gap-3">
          <span className="rounded bg-red-600 px-2 py-1 font-title text-xs font-bold text-white">PDF</span>
          <div>
            <p className="font-data text-sm font-semibold">{archivo.nombre}</p>
            <p className="font-data text-xs text-gray-500">{formatBytes(archivo.tamano)}</p>
          </div>
        </div>
        <button type="button" className="font-title text-sm font-semibold text-red-600 hover:underline" onClick={() => onArchivo(null)}>Quitar</button>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setArrastrando(true);
      }}
      onDragLeave={() => setArrastrando(false)}
      onDrop={(e) => {
        e.preventDefault();
        setArrastrando(false);
        void procesar(e.dataTransfer.files[0]);
      }}
      className={`cursor-pointer rounded-input border-2 border-dashed p-6 text-center transition-colors ${
        arrastrando ? 'border-sena-primary bg-green-50' : 'border-sena-card-border bg-white hover:border-sena-primary'
      }`}
    >
      <p className="font-title text-sm font-semibold text-sena-header">Arrastra aquí el formato en PDF</p>
      <p className="font-data text-xs text-gray-500">o haz clic para seleccionarlo (obligatorio, máx. {formatBytes(MAX_PDF_BYTES)})</p>
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => void procesar(e.target.files?.[0])} />
    </div>
  );
}
