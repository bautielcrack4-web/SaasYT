// Utilidades para preparar imágenes de referencia para la generación.

export interface RefImage {
  buffer: Buffer;
  mime: string;
}

/** Convierte un data URL (data:image/png;base64,...) en buffer + mime. */
export function dataUrlToBuffer(dataUrl: string): RefImage | null {
  const m = dataUrl.match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
  if (!m) return null;
  return { mime: m[1], buffer: Buffer.from(m[2], "base64") };
}

/** Descarga una imagen remota (p. ej. miniatura de YouTube) como buffer. */
export async function fetchImage(url: string): Promise<RefImage | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const mime = res.headers.get("content-type") || "image/jpeg";
    const buffer = Buffer.from(await res.arrayBuffer());
    return { buffer, mime };
  } catch {
    return null;
  }
}

/** Acepta un data URL o una URL remota y devuelve el buffer de referencia. */
export async function resolveReference(
  source: string | null | undefined
): Promise<RefImage | null> {
  if (!source) return null;
  if (source.startsWith("data:")) return dataUrlToBuffer(source);
  if (source.startsWith("http")) return fetchImage(source);
  return null;
}
