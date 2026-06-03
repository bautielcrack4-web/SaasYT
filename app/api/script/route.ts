import { NextResponse } from "next/server";
import { mockScript } from "@/lib/mock";
import { transcribeYouTube } from "@/lib/transcribe";
import { generateScript, isOpenAIConfigured } from "@/lib/openai";

export const maxDuration = 300;
export const runtime = "nodejs";

// POST /api/script  { title: string, sourceUrl?: string, transcript?: string }
// Genera un guion adaptado. Usa la transcripción provista (de /api/analyze) o,
// si solo llega sourceUrl, la obtiene con Gemini. Luego GPT replica el estilo
// y la longitud del original adaptándolo a nuestro canal.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const title: string = body.title || "Tu próximo video viral";
  const sourceUrl: string | undefined = body.sourceUrl;
  let transcript: string = body.transcript || "";
  let transcriptSource: "gemini" | "demo" | "none" = transcript ? "gemini" : "none";
  let transcriptError: string | undefined;

  // Obtener transcripción si no vino en el body.
  if (!transcript && sourceUrl) {
    try {
      const t = await transcribeYouTube(sourceUrl);
      transcript = t.transcript;
      transcriptSource = t.source;
    } catch (e) {
      transcriptError = e instanceof Error ? e.message : "Error de transcripción.";
    }
  }

  // Generación del guion.
  if (isOpenAIConfigured() && transcript) {
    try {
      const script = await generateScript(transcript, title);
      return NextResponse.json({
        ...script,
        transcript,
        transcriptSource,
        transcriptError,
      });
    } catch (e) {
      transcriptError =
        (transcriptError ? transcriptError + " · " : "") +
        (e instanceof Error ? e.message : "Error al generar el guion.");
    }
  }

  // Fallback demo.
  const script = mockScript(title);
  return NextResponse.json({ ...script, transcript, transcriptSource, transcriptError });
}
