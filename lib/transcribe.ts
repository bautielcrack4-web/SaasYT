// ─────────────────────────────────────────────────────────────────────────────
// Transcripción de videos de YouTube con Google Gemini 3 Flash (vía Replicate).
//
// Activación: define REPLICATE_API_TOKEN (ver .env.example).
// Sin token → fallback demo, para que la app siga funcionando sin credenciales.
//
// Modelo: google/gemini-3-flash  →  https://replicate.com/google/gemini-3-flash
// El input `videos` recibe el/los enlace(s) del video y `prompt` la instrucción.
// ─────────────────────────────────────────────────────────────────────────────

import Replicate from "replicate";

export interface TranscriptResult {
  transcript: string;
  source: "gemini" | "demo";
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
    return { transcript: demoTranscript(videoUrl), source: "demo" };
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
  for await (const event of replicate.stream("google/gemini-3-flash", {
    input,
  })) {
    out += String(event);
  }

  const transcript = out.trim();
  if (!transcript) {
    // Si por algún motivo no hubo salida, no rompemos el flujo.
    return { transcript: demoTranscript(videoUrl), source: "demo" };
  }

  return { transcript, source: "gemini" };
}

// Transcripción simulada para el modo demo (sin token).
function demoTranscript(videoUrl: string): string {
  return [
    `[Transcripción DEMO — configura REPLICATE_API_TOKEN para usar Gemini 3 Flash]`,
    `Fuente: ${videoUrl}`,
    "",
    "[00:00] Bienvenidos de nuevo al canal. Hoy vamos a hablar de cómo aprendí a programar desde cero en muy poco tiempo.",
    "[00:14] La mayoría de la gente cree que esto se trata de memorizar comandos, pero el verdadero secreto es otro.",
    "[00:42] [En pantalla: \"3 errores que todos cometen\"] El primer error es saltar de tutorial en tutorial sin construir nada propio.",
    "[01:20] Lo segundo: no entender la lógica detrás del código, solo copiarlo.",
    "[02:05] Y lo tercero, que casi nadie menciona, es no aprender a leer documentación.",
    "[03:10] Si aplicas estas tres cosas, en 90 días vas a estar construyendo tus propios proyectos.",
  ].join("\n");
}
