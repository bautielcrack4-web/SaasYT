import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/health
// Diagnóstico: indica qué variables de entorno VE el servidor en tiempo de
// ejecución (sin exponer los valores). Útil para confirmar la config en Vercel.
export async function GET() {
  return NextResponse.json({
    ok: true,
    env: {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      REPLICATE_API_TOKEN: !!process.env.REPLICATE_API_TOKEN,
      OPENAI_TEXT_MODEL: process.env.OPENAI_TEXT_MODEL || "gpt-4o (por defecto)",
      OPENAI_IMAGE_MODEL:
        process.env.OPENAI_IMAGE_MODEL || "gpt-image-2-2026-04-21 (por defecto)",
    },
    deployedAt: new Date().toISOString(),
  });
}
