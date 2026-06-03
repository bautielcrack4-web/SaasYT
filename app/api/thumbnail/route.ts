import { NextResponse } from "next/server";
import { generateThumbnail, isOpenAIConfigured } from "@/lib/openai";
import { resolveReference } from "@/lib/image";

export const maxDuration = 300;
export const runtime = "nodejs";

// POST /api/thumbnail  { reference?: string (dataURL o URL), instructions?: string }
// Genera una miniatura optimizada con gpt-image-2 a partir de una imagen de
// referencia (miniatura del video o captura del usuario), con quality "low"
// y formato 16:9.
export async function POST(req: Request) {
  if (!isOpenAIConfigured()) {
    return NextResponse.json(
      { error: "Configura OPENAI_API_KEY para generar miniaturas." },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const instructions: string =
    body.instructions ||
    "Crea una miniatura de YouTube optimizada inspirada en el estilo de la referencia.";

  try {
    const reference = await resolveReference(body.reference);
    const imageUrl = await generateThumbnail({ reference, instructions });
    return NextResponse.json({ imageUrl });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No se pudo generar la miniatura." },
      { status: 502 }
    );
  }
}
