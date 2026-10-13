// ============================================================
// Utilidades para manejar archivos: leer PDF, comprimir fotos y descargar.
// ============================================================

// Tamaño máximo del PDF adjunto (el localStorage solo guarda unos 5 MB en total)
export const MAX_PDF_BYTES = 1.5 * 1024 * 1024;
// Tamaño máximo de una imagen antes de comprimirla
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

// Lee un archivo y lo convierte en texto (data URL) para poder guardarlo en localStorage
export function leerComoDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });
}

// Lee un archivo y devuelve sus datos: nombre, tipo, tamaño y contenido
export async function leerAdjunto(file) {
  return {
    nombre: file.name,
    mimeType: file.type,
    tamano: file.size,
    data: await leerComoDataURL(file),
  };
}

// Carga una imagen en memoria para poder dibujarla
function cargarImagen(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('La imagen no es válida.'));
    img.src = src;
  });
}

// Dibuja una imagen o un fotograma de la cámara más pequeño y lo devuelve como JPEG
export function canvasAJpeg(source, anchoOriginal, altoOriginal, maxLado = 1024, calidad = 0.75) {
  const escala = Math.min(1, maxLado / Math.max(anchoOriginal, altoOriginal));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(anchoOriginal * escala);
  canvas.height = Math.round(altoOriginal * escala);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('El navegador no soporta canvas 2D.');
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', calidad);
}

// Comprime una imagen subida para que ocupe poco espacio en localStorage
export async function comprimirImagen(file) {
  const img = await cargarImagen(await leerComoDataURL(file));
  return canvasAJpeg(img, img.naturalWidth, img.naturalHeight);
}

// Descarga un archivo guardado (crea un enlace invisible y le hace clic)
export function descargarDataURL(data, nombre) {
  const a = document.createElement('a');
  a.href = data;
  a.download = nombre;
  a.click();
}
