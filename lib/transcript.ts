// Orquestador de transcripción: prioriza datos REALES y fiables.
//
// 1) Apify (youtube-transcript-scraper): corre con proxies, evita el bloqueo
//    de IP de Vercel → transcripción real y fiable. Fuente principal.
// 2) Subtítulos de YouTube por scraping directo: respaldo gratis (puede fallar
//    desde IPs de datacenter).
//
// NOTA: Gemini 3 Flash (Replicate) se descartó para enlaces de YouTube porque
// Replicate descarga la URL como archivo (la página HTML) y no el video, lo que
// produce el error E006 "Failed to get video duration". Sigue disponible en
// lib/transcribe.ts por si en el futuro se le pasa una URL de video directa.

import { fetchYouTubeCaptions } from "./captions";
import { extractVideoId } from "./youtube";
import { fetchApifyTranscript, isApifyConfigured } from "./apify";

export type TranscriptSource = "apify" | "captions";

export interface Transcript {
  transcript: string;
  source: TranscriptSource;
}

export async function getTranscript(url: string): Promise<Transcript> {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error("El enlace no parece ser un video de YouTube válido.");
  }

  const errors: string[] = [];

  // 1) Apify (fuente principal).
  if (isApifyConfigured()) {
    try {
      const t = await fetchApifyTranscript(url);
      if (t) return { transcript: t, source: "apify" };
      errors.push("Apify no devolvió transcripción (el video puede no tener subtítulos).");
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Error de Apify.");
    }
  } else {
    errors.push("APIFY_TOKEN no configurada.");
  }

  // 2) Respaldo: subtítulos por scraping directo.
  try {
    const captions = await fetchYouTubeCaptions(videoId);
    if (captions) return { transcript: captions, source: "captions" };
  } catch {
    /* ignorado: pasamos al error final */
  }

  throw new Error(
    `No se pudo obtener la transcripción del video. ${errors.join(" ")}`
  );
}
