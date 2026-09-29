import type { ArchivoAdjunto } from '../types';

/** Tamaño máximo del PDF adjunto (localStorage suele limitar a ~5 MB en total). */
export const MAX_PDF_BYTES = 1.5 * 1024 * 1024;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export function leerComoDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });
}

export async function leerAdjunto(file: File): Promise<ArchivoAdjunto> {
  return {
    nombre: file.name,
    mimeType: file.type,
    tamano: file.size,
    data: await leerComoDataURL(file),
  };
}

function cargarImagen(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('La imagen no es válida.'));
    img.src = src;
  });
}

/** Dibuja una fuente (imagen o video) en un canvas redimensionado y devuelve JPEG. */
export function canvasAJpeg(
  source: CanvasImageSource,
  anchoOriginal: number,
  altoOriginal: number,
  maxLado = 1024,
  calidad = 0.75,
): string {
  const escala = Math.min(1, maxLado / Math.max(anchoOriginal, altoOriginal));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(anchoOriginal * escala);
  canvas.height = Math.round(altoOriginal * escala);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('El navegador no soporta canvas 2D.');
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', calidad);
}

/** Comprime una imagen subida para que quepa holgadamente en localStorage. */
export async function comprimirImagen(file: File): Promise<string> {
  const img = await cargarImagen(await leerComoDataURL(file));
  return canvasAJpeg(img, img.naturalWidth, img.naturalHeight);
}

export function descargarDataURL(data: string, nombre: string): void {
  const a = document.createElement('a');
  a.href = data;
  a.download = nombre;
  a.click();
}
