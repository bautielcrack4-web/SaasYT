import { NextResponse } from "next/server";
import { extractVideoId, thumbnailFor, fetchVideoMeta } from "@/lib/youtube";
import { getTranscript } from "@/lib/transcript";
import { analyzeTitle, analyzeThumbnail, isOpenAIConfigured } from "@/lib/openai";
import type { VideoAnalysis } from "@/lib/types";

export const maxDuration = 300;
export const runtime = "nodejs";

// POST /api/analyze  { url: string }
// 1) Título y autor REALES del video (YouTube oEmbed).
// 2) Transcripción REAL (subtítulos de YouTube, o Gemini de respaldo).
// 3) Desglose/optimización del título y análisis de miniatura con GPT.
export async function POST(req: Request) {
  const { url } = await req.json().catch(() => ({ url: "" }));

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Falta el enlace del video." }, { status: 400 });
  }
  if (!isOpenAIConfigured()) {
    return NextResponse.json(
      { error: "Configura OPENAI_API_KEY para analizar videos." },
      { status: 400 }
    );
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    return NextResponse.json(
      { error: "El enlace no parece ser un video de YouTube válido." },
      { status: 400 }
    );
  }

  try {
    // 1) Metadatos reales + 2) transcripción real, en paralelo.
    const [meta, t] = await Promise.all([
      fetchVideoMeta(videoId),
      getTranscript(url),
    ]);

    const thumbnailUrl = thumbnailFor(videoId);

    // 3) Desglose del título (con el título REAL) + análisis de miniatura.
    const [title, insights] = await Promise.all([
      analyzeTitle(t.transcript, meta?.title),
      analyzeThumbnail(thumbnailUrl),
    ]);

    // Garantizamos que el "original" mostrado sea el título real del video.
    if (meta?.title) title.original = meta.title;

    const analysis: VideoAnalysis = {
      videoId,
      sourceUrl: url,
      title,
      thumbnail: { imageUrl: thumbnailUrl, insights },
      transcript: t.transcript,
      transcriptSource: t.source,
      author: meta?.author,
    };

    return NextResponse.json(analysis);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al analizar el video." },
      { status: 502 }
    );
  }
}
