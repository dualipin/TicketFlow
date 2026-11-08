/**
 * Utilidades de compresión en cliente (Imágenes vía Canvas y configuración de MediaRecorder para Audio/Video)
 */

export const MEDIA_LIMITS = {
  MAX_IMAGES: 10,
  MAX_IMAGE_DIMENSION: 1920,
  IMAGE_QUALITY: 0.82,
  IMAGE_COMPRESS_THRESHOLD_BYTES: 800 * 1024, // 800 KB
  MAX_AUDIO_SECONDS: 120, // 2 minutos
  MAX_VIDEO_SECONDS: 60, // 60 segundos
  VIDEO_BITS_PER_SECOND: 1_200_000, // ~1.2 Mbps (aprox 4.5 MB por 30s en 720p)
  AUDIO_BITS_PER_SECOND: 96_000, // 96 kbps
  MAX_VIDEO_FILE_BYTES: 25 * 1024 * 1024, // 25 MB
  MAX_AUDIO_FILE_BYTES: 15 * 1024 * 1024, // 15 MB
  MAX_IMAGE_FILE_BYTES: 10 * 1024 * 1024, // 10 MB
} as const;

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export function formatDuration(seconds?: number | null): string {
  if (seconds === undefined || seconds === null || Number.isNaN(seconds)) {
    return '0:00';
  }
  const totalSec = Math.max(0, Math.round(seconds));
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getBestSupportedAudioMime(): { mimeType: string; ext: string } {
  const candidates = [
    { mimeType: 'audio/webm;codecs=opus', ext: 'webm' },
    { mimeType: 'audio/webm', ext: 'webm' },
    { mimeType: 'audio/mp4', ext: 'm4a' },
    { mimeType: 'audio/ogg;codecs=opus', ext: 'ogg' },
  ];

  if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
    for (const c of candidates) {
      if (MediaRecorder.isTypeSupported(c.mimeType)) {
        return c;
      }
    }
  }

  return { mimeType: 'audio/webm', ext: 'webm' };
}

export function getBestSupportedVideoMime(): { mimeType: string; ext: string } {
  const candidates = [
    { mimeType: 'video/webm;codecs=vp9,opus', ext: 'webm' },
    { mimeType: 'video/webm;codecs=vp8,opus', ext: 'webm' },
    { mimeType: 'video/webm', ext: 'webm' },
    { mimeType: 'video/mp4', ext: 'mp4' },
  ];

  if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
    for (const c of candidates) {
      if (MediaRecorder.isTypeSupported(c.mimeType)) {
        return c;
      }
    }
  }

  return { mimeType: 'video/webm', ext: 'webm' };
}

/**
 * Redimensiona y comprime una imagen en el navegador utilizando HTMLCanvasElement.
 * Si el archivo ya es ligero (< 800 KB) y es un formato web estándar, puede conservarse o recomprimirse si excede 1920px.
 */
export async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise<File>((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      const maxDim = MEDIA_LIMITS.MAX_IMAGE_DIMENSION;
      const needsResize = width > maxDim || height > maxDim;
      const needsCompress = file.size > MEDIA_LIMITS.IMAGE_COMPRESS_THRESHOLD_BYTES;

      if (!needsResize && !needsCompress && file.type !== 'image/heic') {
        resolve(file);
        return;
      }

      if (width > height && width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else if (height >= width && height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const baseName = file.name.replace(/\.[^/.]+$/, '') || `foto_${Date.now()}`;
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file);
            return;
          }
          const compressedFile = new File([blob], `${baseName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        'image/webp',
        MEDIA_LIMITS.IMAGE_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Captura un fotograma de un elemento <video> activo y lo devuelve como File WebP comprimido.
 */
export async function captureVideoFrameToFile(
  videoEl: HTMLVideoElement,
  filename = `captura_${Date.now()}.webp`
): Promise<File> {
  const rawWidth = videoEl.videoWidth || 1280;
  const rawHeight = videoEl.videoHeight || 720;

  let width = rawWidth;
  let height = rawHeight;
  const maxDim = MEDIA_LIMITS.MAX_IMAGE_DIMENSION;

  if (width > height && width > maxDim) {
    height = Math.round((height * maxDim) / width);
    width = maxDim;
  } else if (height >= width && height > maxDim) {
    width = Math.round((width * maxDim) / height);
    height = maxDim;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No se pudo inicializar el lienzo de captura');
  }

  ctx.drawImage(videoEl, 0, 0, width, height);

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('No se pudo generar la fotografía'));
          return;
        }
        resolve(
          new File([blob], filename, {
            type: 'image/webp',
            lastModified: Date.now(),
          })
        );
      },
      'image/webp',
      MEDIA_LIMITS.IMAGE_QUALITY
    );
  });
}
