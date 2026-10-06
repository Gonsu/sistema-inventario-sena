import { useCallback, useEffect, useRef, useState } from 'react';
import { canvasAJpeg } from '../utils/files';

function mensajeError(err) {
  if (err instanceof DOMException) {
    if (err.name === 'NotAllowedError')
      return 'Permiso de cámara denegado. Habilítalo en la configuración del navegador.';
    if (err.name === 'NotFoundError') return 'No se encontró ninguna cámara conectada.';
    if (err.name === 'NotReadableError') return 'La cámara está siendo usada por otra aplicación.';
  }
  return 'No fue posible acceder a la cámara.';
}

/** Controla la webcam con getUserMedia y captura fotogramas mediante canvas. */
export function useWebcam() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [activa, setActiva] = useState(false);
  const [error, setError] = useState(null);

  const detener = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActiva(false);
  }, []);

  const iniciar = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Este navegador no soporta acceso a la cámara (requiere HTTPS o localhost).');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });
      streamRef.current = stream;
      setActiva(true);
    } catch (err) {
      setError(mensajeError(err));
    }
  }, []);

  // Enlazar el stream cuando el <video> ya está montado.
  useEffect(() => {
    if (activa && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play().catch(() => undefined);
    }
  }, [activa]);

  const capturar = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return null;
    return canvasAJpeg(video, video.videoWidth, video.videoHeight);
  }, []);

  useEffect(() => detener, [detener]);

  return { videoRef, activa, error, iniciar, detener, capturar };
}
