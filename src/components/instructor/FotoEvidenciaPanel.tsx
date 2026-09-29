import { useRef, useState } from 'react';
import { useWebcam } from '../../hooks/useWebcam';
import { comprimirImagen, MAX_IMAGE_BYTES } from '../../utils/files';
import { Alerta } from '../ui/Primitives';

interface Props {
  foto: string | null;
  onFoto: (dataUrl: string | null, nombreArchivo: string) => void;
}

/** Panel izquierdo del modal de evidencias: subir imagen o capturar con la webcam. */
export function FotoEvidenciaPanel({ foto, onFoto }: Props) {
  const { videoRef, activa, error: errorCamara, iniciar, detener, capturar } = useWebcam();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const subir = async (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('El archivo debe ser una imagen (JPG, PNG, WEBP).');
    if (file.size > MAX_IMAGE_BYTES) return setError('La imagen supera 8 MB.');
    try {
      detener();
      onFoto(await comprimirImagen(file), file.name);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const tomarFoto = () => {
    const data = capturar();
    if (!data) return setError('La cámara aún no está lista, intenta de nuevo.');
    onFoto(data, `webcam-${Date.now()}.jpg`);
    detener();
  };

  const eliminar = () => {
    onFoto(null, '');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-base">Foto de evidencia</h3>

      <div className="flex aspect-video items-center justify-center overflow-hidden rounded-input border-2 border-dashed border-sena-card-border bg-white">
        {foto ? (
          <img src={foto} alt="Vista previa de la evidencia" className="h-full w-full object-contain" />
        ) : activa ? (
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full -scale-x-100 object-cover" />
        ) : (
          <p className="px-4 text-center font-data text-sm text-gray-500">Sube una imagen o activa la cámara para tomar una foto.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {foto ? (
          <button type="button" className="btn bg-red-600 text-white hover:bg-red-700" onClick={eliminar}>Eliminar foto</button>
        ) : activa ? (
          <>
            <button type="button" className="btn-primary" onClick={tomarFoto}>📸 Tomar foto</button>
            <button type="button" className="btn-secondary" onClick={detener}>Apagar cámara</button>
          </>
        ) : (
          <>
            <button type="button" className="btn-primary" onClick={() => inputRef.current?.click()}>Subir archivo</button>
            <button type="button" className="btn-outline" onClick={() => void iniciar()}>Usar cámara</button>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => void subir(e.target.files?.[0])} />
      </div>

      {(error || errorCamara) && <Alerta>{error ?? errorCamara}</Alerta>}
    </div>
  );
}
