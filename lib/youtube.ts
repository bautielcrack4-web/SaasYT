// Utilidades para trabajar con enlaces de YouTube (sin necesidad de API key).

/** Extrae el ID de video de cualquier formato de URL de YouTube. */
export function extractVideoId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
    /(?:youtube\.com\/live\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  // ¿Es directamente un ID de 11 caracteres?
  if (/^[\w-]{11}$/.test(url.trim())) return url.trim();
  return null;
}

/** Miniatura pública de un video (no requiere API key). */
export function thumbnailFor(videoId: string | null): string {
  if (!videoId) {
    return "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg";
  }
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
