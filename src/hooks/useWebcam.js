// Importar herramientas básicas de React
import { useCallback, useEffect, useRef, useState } from 'react';

// Importar utilidades para manejar archivos e imágenes
import { canvasAJpeg } from '../utils/files';

// Traduce los errores de la cámara a un mensaje entendible
function mensajeError(err) {
  if (err instanceof DOMException) {
    if (err.name === 'NotAllowedError')
      return 'Permiso de cámara denegado. Habilítalo en la configuración del navegador.';
    if (err.name === 'NotFoundError') return 'No se encontró ninguna cámara conectada.';
    if (err.name === 'NotReadableError') return 'La cámara está siendo usada por otra aplicación.';
  }
  return 'No fue posible acceder a la cámara.';
}

// Hook para usar la cámara web: encenderla, apagarla y tomar fotos
export function useWebcam() {
  // videoRef: el <video> donde se ve la cámara; streamRef: la señal de la cámara
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [activa, setActiva] = useState(false);
  const [error, setError] = useState(null);

  // Apagar la cámara
  const detener = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActiva(false);
  }, []);

  // Pedir permiso y encender la cámara
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

  // Tomar una foto del video actual (devuelve la imagen o null si la cámara no está lista)
  const capturar = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return null;
    return canvasAJpeg(video, video.videoWidth, video.videoHeight);
  }, []);

  // Apagar la cámara cuando el componente desaparece
  useEffect(() => detener, [detener]);

  return { videoRef, activa, error, iniciar, detener, capturar };
}
