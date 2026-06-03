import { NextResponse } from "next/server";
import { getTranscript, type TranscriptSource } from "@/lib/transcript";
import { generateScript, isOpenAIConfigured } from "@/lib/openai";

export const maxDuration = 300;
export const runtime = "nodejs";

// POST /api/script  { title: string, sourceUrl?: string, transcript?: string }
// Usa la transcripción provista (de /api/analyze) o, si solo llega sourceUrl,
// la obtiene con Gemini. Luego GPT replica el estilo y la longitud del
// original adaptándolo a nuestro canal.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const title: string = body.title || "";
  const sourceUrl: string | undefined = body.sourceUrl;
  let transcript: string = body.transcript || "";
  const providedSource: TranscriptSource | undefined = body.transcriptSource;

  if (!isOpenAIConfigured()) {
    return NextResponse.json(
      { error: "Configura OPENAI_API_KEY para generar guiones." },
      { status: 400 }
    );
  }
  if (!title) {
    return NextResponse.json({ error: "Falta el título objetivo." }, { status: 400 });
  }

  try {
    // Si llega un enlace y no hay transcripción, la obtenemos (real).
    // Si no hay ni transcripción ni enlace (idea de canal), se genera un
    // guion original a partir del título.
    let transcriptSource: TranscriptSource | undefined = transcript
      ? providedSource || "captions"
      : undefined;
    if (!transcript && sourceUrl) {
      const t = await getTranscript(sourceUrl);
      transcript = t.transcript;
      transcriptSource = t.source;
    }

    const script = await generateScript(transcript, title);
    return NextResponse.json({
      ...script,
      transcript: transcript || undefined,
      transcriptSource,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al generar el guion." },
      { status: 502 }
    );
  }
}
