import { NextResponse } from "next/server";
import { mockChannelAnalysis } from "@/lib/mock";

// POST /api/channel  { channelName: string, screenshot?: string (dataURL) }
// Analiza un canal (a partir de una captura) y genera 9 ideas de video.
export async function POST(req: Request) {
  const { channelName } = await req
    .json()
    .catch(() => ({ channelName: "" }));

  // ───────────────────────────────────────────────────────────────────────
  // TODO (IA real): reemplazar mockChannelAnalysis por:
  //   1. Enviar la captura (screenshot) a un modelo con visión
  //      (Anthropic Claude / OpenAI GPT-4o) para identificar nicho y estilo.
  //   2. Generar 9 ideas de video + miniaturas adaptadas.
  // Mantener la forma ChannelAnalysis.
  // ───────────────────────────────────────────────────────────────────────
  const analysis = mockChannelAnalysis(channelName || "Canal de YouTube");

  await new Promise((r) => setTimeout(r, 900));

  return NextResponse.json(analysis);
}
