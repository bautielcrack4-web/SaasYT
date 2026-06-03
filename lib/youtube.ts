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

/** Miniatura pública en alta resolución de un video (no requiere API key). */
export function thumbnailFor(videoId: string | null): string {
  if (!videoId) return "";
  return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
}

export interface VideoMeta {
  title: string;
  author: string;
}

/**
 * Obtiene el título y autor REALES del video con la API pública oEmbed de
 * YouTube (no requiere API key). Devuelve null si el video no es accesible.
 */
export async function fetchVideoMeta(
  videoId: string
): Promise<VideoMeta | null> {
  try {
    const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      `https://www.youtube.com/watch?v=${videoId}`
    )}&format=json`;
    const res = await fetch(url, { headers: { "Accept-Language": "es,en" } });
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string; author_name?: string };
    if (!data.title) return null;
    return { title: data.title, author: data.author_name || "" };
  } catch {
    return null;
  }
}
