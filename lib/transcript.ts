// Orquestador de transcripción: prioriza datos REALES.
//
// 1) Subtítulos reales de YouTube (texto hablado verídico, sin API key).
// 2) Si el video no tiene subtítulos, recurre a Gemini 3 Flash (Replicate).
//
// Así la transcripción nunca es inventada: o son los subtítulos reales del
// video, o la transcripción del modelo sobre el contenido real.

import { fetchYouTubeCaptions } from "./captions";
import { extractVideoId } from "./youtube";
import { transcribeYouTube, isGeminiConfigured } from "./transcribe";

export type TranscriptSource = "captions" | "gemini";

export interface Transcript {
  transcript: string;
  source: TranscriptSource;
}

export async function getTranscript(url: string): Promise<Transcript> {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error("El enlace no parece ser un video de YouTube válido.");
  }

  // 1) Subtítulos reales del video.
  const captions = await fetchYouTubeCaptions(videoId);
  if (captions) {
    return { transcript: captions, source: "captions" };
  }

  // 2) Respaldo: Gemini 3 Flash.
  if (!isGeminiConfigured()) {
    throw new Error(
      "El video no tiene subtítulos disponibles y REPLICATE_API_TOKEN no está configurada para usar Gemini como respaldo."
    );
  }
  const g = await transcribeYouTube(url);
  return { transcript: g.transcript, source: "gemini" };
}
