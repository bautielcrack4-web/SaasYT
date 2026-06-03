// ─────────────────────────────────────────────────────────────────────────────
// Transcripción de videos de YouTube con Google Gemini 3 Flash (vía Replicate).
//
// Requiere REPLICATE_API_TOKEN (ver .env.example). Sin token lanza error.
//
// Modelo: google/gemini-3-flash  →  https://replicate.com/google/gemini-3-flash
// El input `videos` recibe el/los enlace(s) del video y `prompt` la instrucción.
// ─────────────────────────────────────────────────────────────────────────────

import Replicate from "replicate";

export interface TranscriptResult {
  transcript: string;
  source: "gemini";
}

// Instrucción enviada a Gemini junto con el enlace del video.
const TRANSCRIBE_PROMPT = [
  "Eres un transcriptor profesional de video.",
  "Transcribe ESTE video de forma completa y detallada, sin resumir.",
  "Reglas:",
  "1. Transcribe el audio hablado de forma verbatim, en su idioma original.",
  "2. Incluye marcas de tiempo en formato [MM:SS] al inicio de cada segmento o cambio relevante.",
  "3. Cuando aparezca texto importante en pantalla o haya contexto visual clave, anótalo entre corchetes, p. ej. [En pantalla: ...].",
  "4. Mantén el orden cronológico y no inventes contenido que no esté en el video.",
  "Devuelve únicamente la transcripción.",
].join("\n");

export const isGeminiConfigured = (): boolean =>
  !!process.env.REPLICATE_API_TOKEN;

/**
 * Extrae la transcripción detallada de un video de YouTube.
 * @param videoUrl Enlace que el usuario pegó (URL de YouTube).
 */
export async function transcribeYouTube(
  videoUrl: string
): Promise<TranscriptResult> {
  if (!isGeminiConfigured()) {
    throw new Error(
      "REPLICATE_API_TOKEN no configurada: no se puede transcribir el video."
    );
  }

  // El cliente toma el token de process.env.REPLICATE_API_TOKEN.
  const replicate = new Replicate();

  const input = {
    prompt: TRANSCRIBE_PROMPT,
    // NOTA: pasamos el enlace tal cual lo subió el usuario. Si en el futuro
    // Replicate no resolviera enlaces de YouTube directamente, aquí es donde
    // habría que sustituir `videoUrl` por una URL de archivo descargable.
    videos: [videoUrl],
    thinking_level: "low" as const,
  };

  // La respuesta del modelo llega en streaming; concatenamos los fragmentos.
  let out = "";
  try {
    for await (const event of replicate.stream("google/gemini-3-flash", {
      input,
    })) {
      out += String(event);
    }
  } catch (err) {
    // Fallback: errores transitorios de streaming -> llamada bloqueante.
    try {
      const result = await replicate.run("google/gemini-3-flash", { input });
      out = Array.isArray(result) ? result.join("") : String(result);
    } catch {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Replicate (gemini-3-flash) falló: ${msg}`);
    }
  }

  const transcript = out.trim();
  if (!transcript) {
    throw new Error(
      "Gemini no devolvió transcripción. Verifica que el enlace sea público y que Replicate acepte URLs de YouTube directamente."
    );
  }

  return { transcript, source: "gemini" };
}
