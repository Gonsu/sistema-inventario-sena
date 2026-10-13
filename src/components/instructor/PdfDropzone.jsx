// Importar herramientas básicas de React
import { useRef, useState } from 'react';

// Importar funciones de formato (pesos, fechas) y búsqueda
import { formatBytes } from '../../utils/format';

// Importar utilidades para manejar archivos e imágenes
import { leerAdjunto, MAX_PDF_BYTES } from '../../utils/files';

// Zona para adjuntar el formato en PDF: se puede arrastrar el archivo o hacer clic para buscarlo.
// Recibe:
//  - archivo: el PDF ya cargado (o null)
//  - onArchivo: se llama con el archivo leído (o null al quitarlo)
//  - onError: se llama con el mensaje de error (o null)
function PdfDropzone({ archivo, onArchivo, onError }) {
  // Referencia al <input type="file"> oculto, para abrirlo al hacer clic en la zona
  const inputRef = useRef(null);
  // true mientras el usuario arrastra un archivo encima (para resaltar la zona)
  const [arrastrando, setArrastrando] = useState(false);

  // Valida el archivo (que sea PDF y no pese demasiado) y lo lee
  const procesar = async (file) => {
    onError(null);
    if (!file) return;
    if (file.type !== 'application/pdf') return onError('El formato debe ser un archivo PDF.');
    if (file.size > MAX_PDF_BYTES)
      return onError(`El PDF supera el límite de ${formatBytes(MAX_PDF_BYTES)}.`);
    try {
      onArchivo(await leerAdjunto(file));
    } catch (e) {
      onError(e.message);
    }
  };

  // Si ya hay un PDF cargado, mostrar su nombre y el botón "Quitar"
  if (archivo) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-input border border-sena-primary bg-green-50 p-3">
        <div className="flex items-center gap-3">
          <span className="rounded bg-red-600 px-2 py-1 font-title text-xs font-bold text-white">
            PDF
          </span>
          <div>
            <p className="font-data text-sm font-semibold">{archivo.nombre}</p>
            <p className="font-data text-xs text-gray-500">{formatBytes(archivo.tamano)}</p>
          </div>
        </div>
        <button
          type="button"
          className="font-title text-sm font-semibold text-red-600 hover:underline"
          onClick={() => onArchivo(null)}
        >
          Quitar
        </button>
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
        arrastrando
          ? 'border-sena-primary bg-green-50'
          : 'border-sena-card-border bg-white hover:border-sena-primary'
      }`}
    >
      {/* Zona vacía: invita a arrastrar o seleccionar el PDF */}
      <p className="font-title text-sm font-semibold text-sena-header">
        Arrastra aquí el formato en PDF
      </p>
      <p className="font-data text-xs text-gray-500">
        o haz clic para seleccionarlo (obligatorio, máx. {formatBytes(MAX_PDF_BYTES)})
      </p>
      {/* Selector de archivos oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => void procesar(e.target.files?.[0])}
      />
    </div>
  );
}

export default PdfDropzone;
