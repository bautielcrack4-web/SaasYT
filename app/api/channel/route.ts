import { NextResponse } from "next/server";
import { mockChannelAnalysis } from "@/lib/mock";
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

// POST /api/channel  { channelName: string, screenshot?: string (dataURL) }
// Analiza un canal (visión GPT sobre la captura) y genera 9 ideas de video.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const channelName: string = body.channelName || "Canal de YouTube";
  const screenshot: string | undefined = body.screenshot;

  // Sin OpenAI o sin captura → modo demo.
  if (!isOpenAIConfigured() || !screenshot) {
    return NextResponse.json(mockChannelAnalysis(channelName));
  }

  try {
    const result = await analyzeChannelScreenshot(screenshot, channelName);
    const seed = hash(result.channelName || channelName);
    const videos: ChannelVideoIdea[] = result.videos.map((v, i) => ({
      id: `${seed}-${i}`,
      title: v.title,
      // Las miniaturas se generan bajo demanda en /api/thumbnail.
      thumbnailUrl: `https://picsum.photos/seed/${seed + i}/640/360`,
      virality: v.virality,
    }));

    const analysis: ChannelAnalysis = {
      id: `${seed}-${Date.now()}`,
      channelName: result.channelName || channelName,
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
