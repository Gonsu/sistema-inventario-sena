// Importar herramientas básicas de React
import { useRef, useState } from 'react';

// Importar el hook que controla la cámara
import { useWebcam } from '../../hooks/useWebcam';

// Importar utilidades para manejar archivos e imágenes
import { comprimirImagen, MAX_IMAGE_BYTES } from '../../utils/files';

// Importar componentes visuales reutilizables
import Alerta from '../ui/Alerta';

// Panel izquierdo de la ventana de evidencias:
// permite subir una imagen o tomar una foto con la cámara web.
function FotoEvidenciaPanel({ foto, onFoto }) {
  // Control de la cámara web
  const { videoRef, activa, error: errorCamara, iniciar, detener, capturar } = useWebcam();
  // Referencia al <input type="file"> oculto y mensaje de error
  const inputRef = useRef(null);
  const [error, setError] = useState(null);

  // Cuando se sube un archivo: validar que sea imagen, comprimirla y guardarla
  const subir = async (file) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith('image/'))
      return setError('El archivo debe ser una imagen (JPG, PNG, WEBP).');
    if (file.size > MAX_IMAGE_BYTES) return setError('La imagen supera 8 MB.');
    try {
      detener();
      onFoto(await comprimirImagen(file), file.name);
    } catch (e) {
      setError(e.message);
    }
  };

  // Tomar una foto con la cámara
  const tomarFoto = () => {
    const data = capturar();
    if (!data) return setError('La cámara aún no está lista, intenta de nuevo.');
    onFoto(data, `webcam-${Date.now()}.jpg`);
    detener();
  };

  // Quitar la foto para poder elegir otra
  const eliminar = () => {
    onFoto(null, '');
    if (inputRef.current) inputRef.current.value = '';
  };

  // Todo componente de React debe retornar un solo contenedor padre
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-base">Foto de evidencia</h3>

      {/* Recuadro de vista previa: muestra la foto, la cámara o un mensaje */}
      <div className="flex aspect-video items-center justify-center overflow-hidden rounded-input border-2 border-dashed border-sena-card-border bg-white">
        {foto ? (
          <img
            src={foto}
            alt="Vista previa de la evidencia"
            className="h-full w-full object-contain"
          />
        ) : activa ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full -scale-x-100 object-cover"
          />
        ) : (
          <p className="px-4 text-center font-data text-sm text-gray-500">
            Sube una imagen o activa la cámara para tomar una foto.
          </p>
        )}
      </div>

      {/* Botones: cambian según si hay foto, si la cámara está activa o ninguna */}
      <div className="flex flex-wrap gap-2">
        {foto ? (
          <button
            type="button"
            className="btn bg-red-600 text-white hover:bg-red-700"
            onClick={eliminar}
          >
            Eliminar foto
          </button>
        ) : activa ? (
          <>
            <button type="button" className="btn-primary" onClick={tomarFoto}>
              📸 Tomar foto
            </button>
            <button type="button" className="btn-secondary" onClick={detener}>
              Apagar cámara
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn-primary" onClick={() => inputRef.current?.click()}>
              Subir archivo
            </button>
            <button type="button" className="btn-outline" onClick={() => void iniciar()}>
              Usar cámara
            </button>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void subir(e.target.files?.[0])}
        />
      </div>

      {/* Mensaje de error */}
      {(error || errorCamara) && <Alerta>{error ?? errorCamara}</Alerta>}
    </div>
  );
}

export default FotoEvidenciaPanel;
