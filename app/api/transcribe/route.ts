import { NextResponse } from "next/server";
import { extractVideoId } from "@/lib/youtube";
import { transcribeYouTube } from "@/lib/transcribe";

// La transcripción de un video puede tardar; ampliamos el límite en Vercel.
export const maxDuration = 300;
export const runtime = "nodejs";

// POST /api/transcribe  { url: string }
// Devuelve la transcripción detallada del video (Gemini 3 Flash vía Replicate).
export async function POST(req: Request) {
  const { url } = await req.json().catch(() => ({ url: "" }));

  if (!url || typeof url !== "string") {
    return NextResponse.json(
      { error: "Falta el enlace del video." },
      { status: 400 }
    );
  }
  if (!extractVideoId(url)) {
    return NextResponse.json(
      { error: "El enlace no parece ser un video de YouTube válido." },
      { status: 400 }
    );
  }

  try {
    const result = await transcribeYouTube(url);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "No se pudo transcribir el video.",
      },
      { status: 502 }
    );
  }
}
