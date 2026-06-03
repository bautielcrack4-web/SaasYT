import { NextResponse } from "next/server";
import { extractVideoId } from "@/lib/youtube";
import { mockVideoAnalysis } from "@/lib/mock";

// POST /api/analyze  { url: string }
// Devuelve título optimizado + análisis de miniatura para un video de YouTube.
export async function POST(req: Request) {
  const { url } = await req.json().catch(() => ({ url: "" }));

  if (!url || typeof url !== "string") {
    return NextResponse.json(
      { error: "Falta el enlace del video." },
      { status: 400 }
    );
  }

  const videoId = extractVideoId(url);

  // ───────────────────────────────────────────────────────────────────────
  // TODO (IA real): reemplazar mockVideoAnalysis por:
  //   1. Obtener metadata/transcript del video (YouTube Data API).
  //   2. Pedir a Anthropic/OpenAI un título optimizado + análisis de estilo.
  //   3. (opcional) Generar/restilizar la miniatura.
  // Mantener la misma forma de respuesta (VideoAnalysis) para no tocar la UI.
  // ───────────────────────────────────────────────────────────────────────
  const analysis = mockVideoAnalysis(url, videoId);

  // Pequeña latencia simulada para que la UI muestre el estado de carga.
  await new Promise((r) => setTimeout(r, 600));

  return NextResponse.json(analysis);
}
