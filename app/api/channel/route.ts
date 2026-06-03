import { NextResponse } from "next/server";
import { analyzeChannelScreenshot, isOpenAIConfigured } from "@/lib/openai";
import type { ChannelAnalysis, ChannelVideoIdea } from "@/lib/types";

export const maxDuration = 300;
export const runtime = "nodejs";

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// POST /api/channel  { channelName: string, screenshot: string (dataURL) }
// Analiza un canal (visión GPT sobre la captura) y genera 9 ideas de video.
// Las miniaturas adaptadas se generan bajo demanda en /api/thumbnail.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const channelName: string = body.channelName || "";
  const screenshot: string | undefined = body.screenshot;

  if (!isOpenAIConfigured()) {
    return NextResponse.json(
      { error: "Configura OPENAI_API_KEY para analizar canales." },
      { status: 400 }
    );
  }
  if (!screenshot) {
    return NextResponse.json(
      { error: "Sube una captura del canal para analizarlo." },
      { status: 400 }
    );
  }

  try {
    const result = await analyzeChannelScreenshot(screenshot, channelName);
    const seed = hash(result.channelName || channelName || String(Date.now()));
    const videos: ChannelVideoIdea[] = result.videos.map((v, i) => ({
      id: `${seed}-${i}`,
      title: v.title,
      thumbnailUrl: "", // se genera bajo demanda con gpt-image-2
      virality: v.virality,
    }));

    const analysis: ChannelAnalysis = {
      id: `${seed}-${Date.now()}`,
      channelName: result.channelName || channelName || "Canal de YouTube",
      createdAt: Date.now(),
      adaptedTitle: result.adaptedTitle,
      thumbnailStyle: result.thumbnailStyle,
      videos,
    };
    return NextResponse.json(analysis);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No se pudo analizar el canal." },
      { status: 502 }
    );
  }
}
