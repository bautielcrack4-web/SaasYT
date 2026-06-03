// ─────────────────────────────────────────────────────────────────────────────
// Integración con OpenAI: análisis de título, generación de guion y miniaturas.
//
// Activación: define OPENAI_API_KEY (ver .env.example).
// Sin key → las funciones lanzan NotConfiguredError y las rutas usan el mock.
//
// Texto:    https://developers.openai.com/api/docs/guides/text
// Imágenes: https://developers.openai.com/api/docs/guides/image-generation
// ─────────────────────────────────────────────────────────────────────────────

import OpenAI, { toFile } from "openai";
import type {
  ChannelVideoIdea,
  GeneratedScript,
  ScriptBlock,
  TitleAnalysis,
} from "./types";

export class NotConfiguredError extends Error {
  constructor() {
    super("OPENAI_API_KEY no configurada");
    this.name = "NotConfiguredError";
  }
}

export const isOpenAIConfigured = (): boolean => !!process.env.OPENAI_API_KEY;

// Modelos (configurables por env; valores por defecto según lo solicitado).
const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || "gpt-4o";
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2-2026-04-21";
// gpt-image admite tamaños horizontales; 1536x1024 es el landscape estándar.
// El ratio final se refuerza añadiendo "dimension: 16:9" al prompt.
const IMAGE_SIZE = process.env.OPENAI_IMAGE_SIZE || "1536x1024";

function client(): OpenAI {
  if (!isOpenAIConfigured()) throw new NotConfiguredError();
  return new OpenAI();
}

// Iconos válidos (Material Symbols) que puede usar el desglose de estilo.
const ALLOWED_ICONS = [
  "favorite", "help", "bolt", "psychology", "visibility", "trending_up",
  "local_fire_department", "lightbulb", "ads_click", "schedule", "groups",
  "emoji_objects", "priority_high",
];

function extractJson<T>(raw: string): T {
  // Tolera respuestas con ```json ... ``` o texto alrededor.
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : raw;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  const slice = start >= 0 && end >= 0 ? body.slice(start, end + 1) : body;
  return JSON.parse(slice) as T;
}

// ── 1. Desglose y optimización del título ───────────────────────────────────
export async function analyzeTitle(
  transcript: string,
  originalTitle?: string
): Promise<TitleAnalysis> {
  const res = await client().chat.completions.create({
    model: TEXT_MODEL,
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Eres un estratega experto en títulos virales de YouTube. Analizas el formato y estilo de escritura de un título y devuelves una versión optimizada que conserva el formato pero mejora el gancho. Respondes SOLO en JSON.",
      },
      {
        role: "user",
        content: `Basándote en esta transcripción del video, deduce el título original (o usa el provisto) y genera uno optimizado.

${originalTitle ? `Título original: "${originalTitle}"` : "Título original: dedúcelo del contenido."}

Transcripción:
"""
${transcript.slice(0, 8000)}
"""

Devuelve este JSON exacto:
{
  "original": "título original",
  "optimized": "título optimizado, mismo formato pero mejor gancho",
  "score": <entero 0-100 del título optimizado>,
  "styleTags": [ { "label": "nombre del recurso de escritura, 1-3 palabras", "icon": "<uno de: ${ALLOWED_ICONS.join(", ")}>" } ]
}
Incluye 3 styleTags que describan el estilo de escritura detectado (p. ej. "Gancho emocional", "Curiosidad", "Urgencia").`,
      },
    ],
  });

  const parsed = extractJson<TitleAnalysis>(
    res.choices[0]?.message?.content || "{}"
  );
  // Saneamos los iconos a la lista permitida.
  parsed.styleTags = (parsed.styleTags || []).slice(0, 4).map((t) => ({
    label: t.label,
    icon: ALLOWED_ICONS.includes(t.icon) ? t.icon : "lightbulb",
  }));
  parsed.score = Math.max(0, Math.min(100, Math.round(parsed.score || 90)));
  return parsed;
}

// ── 2. Generación de guion adaptado ─────────────────────────────────────────
export async function generateScript(
  transcript: string,
  optimizedTitle: string
): Promise<GeneratedScript> {
  const targetChars = transcript.replace(/\[[^\]]*\]/g, "").trim().length;

  const res = await client().chat.completions.create({
    model: TEXT_MODEL,
    temperature: 0.8,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Eres un guionista de YouTube. Analizas la transcripción de un video y replicas su estilo de escritura EXACTO y su longitud aproximada en caracteres, pero adaptas el contenido a nuestro canal: mismo nicho, nueva información de valor, otro ángulo. Respondes SOLO en JSON.",
      },
      {
        role: "user",
        content: `Transcripción de referencia (analiza su estilo, tono y estructura):
"""
${transcript.slice(0, 12000)}
"""

Título objetivo del nuevo video: "${optimizedTitle}"

Requisitos:
- Replica el ESTILO de escritura y el tono exactos de la transcripción.
- La longitud total del guion debe acercarse a ${targetChars} caracteres (longitud del original).
- Aporta NUEVA información de valor y un ÁNGULO distinto, adaptado a nuestro canal.
- No copies frases del original; reescríbelo.

Devuelve este JSON exacto:
{
  "title": "${optimizedTitle}",
  "blocks": [
    { "kind": "angle", "label": "NUEVO ÁNGULO: ...", "body": "frase potente del nuevo enfoque" },
    { "kind": "section", "label": "EL GANCHO", "timestamp": "00:00 - 00:15", "body": "texto del guion" },
    { "kind": "value", "label": "NUEVA INFORMACIÓN DE VALOR", "items": ["punto 1", "punto 2", "punto 3"] },
    { "kind": "section", "label": "DESARROLLO", "timestamp": "00:15 - ...", "body": "texto del guion" },
    { "kind": "section", "label": "CIERRE / CTA", "timestamp": "... ", "body": "texto del guion" }
  ]
}`,
      },
    ],
  });

  const parsed = extractJson<GeneratedScript>(
    res.choices[0]?.message?.content || "{}"
  );
  parsed.title = parsed.title || optimizedTitle;
  parsed.blocks = (parsed.blocks || []).filter(
    (b: ScriptBlock) => b && b.kind && b.label
  );
  return parsed;
}

// ── 3. Generación de miniatura ──────────────────────────────────────────────
export interface ThumbnailRequest {
  /** Imagen de referencia (miniatura del video o captura del usuario). */
  reference?: { buffer: Buffer; mime: string } | null;
  /** Indicaciones: texto distinto, ángulo, etc. */
  instructions: string;
}

export async function generateThumbnail(
  req: ThumbnailRequest
): Promise<string> {
  const c = client();
  // El sufijo "dimension: 16:9" es obligatorio para forzar el formato correcto.
  const prompt = `${req.instructions}\n\nMantén un estilo de miniatura de YouTube de alto CTR: alto contraste, sujeto expresivo, texto corto y legible, pero con un texto DISTINTO y otro ángulo respecto a la referencia. dimension: 16:9`;

  const common = {
    model: IMAGE_MODEL,
    prompt,
    size: IMAGE_SIZE as "1536x1024",
    quality: "low" as const,
    n: 1,
  };

  let b64: string | undefined;
  if (req.reference) {
    // Usa la imagen del usuario como referencia de estilo.
    const file = await toFile(req.reference.buffer, "reference.png", {
      type: req.reference.mime || "image/png",
    });
    const res = await c.images.edit({ ...common, image: file });
    b64 = res.data?.[0]?.b64_json;
  } else {
    const res = await c.images.generate(common);
    b64 = res.data?.[0]?.b64_json;
  }

  if (!b64) throw new Error("OpenAI no devolvió imagen.");
  return `data:image/png;base64,${b64}`;
}

// ── 4. Análisis de canal (visión sobre la captura) ──────────────────────────
export interface ChannelAnalysisResult {
  channelName: string;
  adaptedTitle: string;
  thumbnailStyle: string;
  videos: { title: string; virality: ChannelVideoIdea["virality"] }[];
}

export async function analyzeChannelScreenshot(
  imageDataUrl: string,
  channelName?: string
): Promise<ChannelAnalysisResult> {
  const res = await client().chat.completions.create({
    model: TEXT_MODEL,
    temperature: 0.8,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Eres un estratega de contenido de YouTube. Analizas la captura de un canal (nicho, estilo de miniaturas, tono de títulos) y propones contenido adaptado. Respondes SOLO en JSON.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analiza este canal${channelName ? ` ("${channelName}")` : ""}. Devuelve este JSON exacto:
{
  "channelName": "nombre del canal",
  "adaptedTitle": "un título adaptado a nuestro canal en el estilo detectado",
  "thumbnailStyle": "descripción del estilo de miniatura para replicar (composición, colores, texto)",
  "videos": [ { "title": "idea de video", "virality": "ALTA|CRÍTICA|MEDIA" } ]
}
Incluye EXACTAMENTE 9 videos en "videos".`,
          },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ],
      },
    ],
  });

  const parsed = extractJson<ChannelAnalysisResult>(
    res.choices[0]?.message?.content || "{}"
  );
  parsed.videos = (parsed.videos || []).slice(0, 9).map((v) => ({
    title: v.title,
    virality: ["ALTA", "CRÍTICA", "MEDIA"].includes(v.virality)
      ? v.virality
      : "ALTA",
  }));
  return parsed;
}
