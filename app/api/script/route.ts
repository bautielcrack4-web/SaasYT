import { NextResponse } from "next/server";
import { mockScript } from "@/lib/mock";
import { transcribeYouTube } from "@/lib/transcribe";

export const maxDuration = 300;
export const runtime = "nodejs";

// POST /api/script  { title: string, sourceUrl?: string }
// Genera un guion adaptado. Si llega sourceUrl, primero obtiene la
// transcripción real del video (Gemini 3 Flash) y la usa como base.
export async function POST(req: Request) {
  const { title, sourceUrl } = await req
    .json()
    .catch(() => ({ title: "", sourceUrl: "" }));

  // 1. Base de conocimiento: transcripción del video original.
  let transcript = "";
  let transcriptSource: "gemini" | "demo" | "none" = "none";
  if (sourceUrl && typeof sourceUrl === "string") {
    try {
      const t = await transcribeYouTube(sourceUrl);
      transcript = t.transcript;
      transcriptSource = t.source;
    } catch {
      transcriptSource = "none";
    }
  }

  // 2. Generación del guion.
  // ───────────────────────────────────────────────────────────────────────
  // TODO (IA real): reemplazar mockScript por una llamada a Anthropic/OpenAI
  // que reciba `transcript` + `title` y produzca un guion con nuevos ángulos
  // de valor, manteniendo el formato GeneratedScript.
  // ───────────────────────────────────────────────────────────────────────
  const script = mockScript(title || "Tu próximo video viral");

  return NextResponse.json({ ...script, transcriptSource, transcript });
}
