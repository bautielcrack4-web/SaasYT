import { NextResponse } from "next/server";
import { extractVideoId, thumbnailFor } from "@/lib/youtube";
import { transcribeYouTube } from "@/lib/transcribe";
import { analyzeTitle, analyzeThumbnail, isOpenAIConfigured } from "@/lib/openai";
import type { VideoAnalysis } from "@/lib/types";

export const maxDuration = 300;
export const runtime = "nodejs";

// POST /api/analyze  { url: string }
// 1) Transcribe el video (Gemini 3 Flash).
// 2) Desglosa y optimiza el título con GPT a partir de la transcripción.
// 3) Analiza la miniatura original con GPT (visión).
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
    // 1) Transcripción (base del análisis).
    const t = await transcribeYouTube(url);

    const thumbnailUrl = thumbnailFor(videoId);

    // 2 y 3) En paralelo: desglose del título + análisis de la miniatura.
    const [title, insights] = await Promise.all([
      analyzeTitle(t.transcript),
      analyzeThumbnail(thumbnailUrl),
    ]);

    const analysis: VideoAnalysis = {
      videoId,
      sourceUrl: url,
      title,
      thumbnail: { imageUrl: thumbnailUrl, insights },
      transcript: t.transcript,
      transcriptSource: t.source,
    };

    return NextResponse.json(analysis);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al analizar el video." },
      { status: 502 }
    );
  }
}
