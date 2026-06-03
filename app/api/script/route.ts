import { NextResponse } from "next/server";
import { mockScript } from "@/lib/mock";

// POST /api/script  { title: string, sourceUrl?: string }
// Genera un guion adaptado a partir de un título / video de referencia.
export async function POST(req: Request) {
  const { title } = await req.json().catch(() => ({ title: "" }));

  // ───────────────────────────────────────────────────────────────────────
  // TODO (IA real): reemplazar mockScript por una llamada a Anthropic/OpenAI
  // que reciba el transcript original y produzca un guion con nuevos ángulos
  // de valor, manteniendo el formato GeneratedScript.
  // ───────────────────────────────────────────────────────────────────────
  const script = mockScript(title || "Tu próximo video viral");

  await new Promise((r) => setTimeout(r, 800));

  return NextResponse.json(script);
}
