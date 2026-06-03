import { NextResponse } from "next/server";
import { extractVideoId, thumbnailFor } from "@/lib/youtube";
import { mockVideoAnalysis } from "@/lib/mock";
import { transcribeYouTube } from "@/lib/transcribe";
import { analyzeTitle, isOpenAIConfigured } from "@/lib/openai";
import type { VideoAnalysis } from "@/lib/types";

export const maxDuration = 300;
export const runtime = "nodejs";

// POST /api/analyze  { url: string }
// 1) Transcribe el video (Gemini 3 Flash).
// 2) Desglosa y optimiza el título con GPT a partir de la transcripción.
export async function POST(req: Request) {
  const { url } = await req.json().catch(() => ({ url: "" }));

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Falta el enlace del video." }, { status: 400 });
  }

  const videoId = extractVideoId(url);

  // Sin OpenAI configurado → modo demo completo (pero igual intentamos
  // transcribir si hay token de Replicate, para que el panel lo muestre).
  if (!isOpenAIConfigured()) {
    const demo = mockVideoAnalysis(url, videoId);
    return NextResponse.json(demo);
  }

  try {
    // 1) Transcripción (base del análisis).
    const t = await transcribeYouTube(url);

    // 2) Desglose + optimización del título con GPT.
    const title = await analyzeTitle(t.transcript);

    const analysis: VideoAnalysis = {
      videoId,
      sourceUrl: url,
      title,
      thumbnail: {
        // La miniatura optimizada se genera bajo demanda en /api/thumbnail.
        imageUrl: thumbnailFor(videoId),
        insights: [
          {
            title: "Composición de Alto Contraste",
            description:
              "Sujeto iluminado con luz de contorno para destacar sobre el fondo.",
          },
          {
            title: "Jerarquía Visual",
            description: "Texto minimalista en la zona de mayor impacto visual.",
          },
        ],
      },
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
