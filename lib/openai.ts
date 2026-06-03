// ─────────────────────────────────────────────────────────────────────────────
// Integración con OpenAI: análisis de título, generación de guion y miniaturas.
//
// Activación: define OPENAI_API_KEY (ver .env.example).
// Sin key → las funciones lanzan NotConfiguredError y las rutas responden 400.
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

const SCRIPT_SYSTEM_PROMPT = `Eres un guionista profesional de YouTube, experto en retención de audiencia, storytelling y CTR. Tu trabajo es estudiar el guion (transcripción) de un video de referencia y escribir un guion NUEVO para nuestro canal sobre el mismo tema.

OBJETIVO
Producir un guion listo para grabar, que suene natural al hablarlo, con altísima retención de principio a fin.

ANÁLISIS PREVIO (hazlo mentalmente, no lo imprimas)
1. Detecta el ESTILO de escritura del original: tono (cercano/formal/enérgico), ritmo de frases, uso de preguntas, jerga del nicho, persona (tú/ustedes/nosotros), nivel técnico.
2. Detecta la ESTRUCTURA narrativa y los "loops abiertos" que mantienen la atención.
3. Mide la LONGITUD aproximada en caracteres del original.

REGLAS DE ESCRITURA DEL NUEVO GUION
- Replica el ESTILO, tono, ritmo y persona del original con precisión: debe parecer del mismo tipo de creador.
- Ajusta la longitud total del guion para que se aproxime a la del original (±10 %).
- Escribe en el MISMO idioma que la transcripción de referencia.
- Aporta un ÁNGULO DISTINTO y NUEVA información de valor real (datos, marcos, ejemplos, pasos accionables) que el original no menciona. No parafrasees ni copies frases del original.
- Gancho potentísimo en los primeros 15 segundos: promesa clara + intriga (open loop). Nada de "hola, bienvenidos a un nuevo video".
- Mantén la retención: pattern interrupts, micro-cliffhangers, ejemplos concretos, ritmo variado, frases cortas para hablar.
- Cierre con conclusión satisfactoria + llamada a la acción específica (comentario/suscripción/siguiente video).
- Escribe el cuerpo como lo diría el creador frente a cámara (no escenografía entre paréntesis salvo lo imprescindible).

FORMATO DE SALIDA
Responde SOLO con un objeto JSON válido, sin texto adicional, con esta forma:
{
  "title": "título del nuevo video",
  "blocks": [
    { "kind": "angle",   "label": "NUEVO ÁNGULO: <resumen>", "body": "1-2 frases que explican el enfoque diferenciador" },
    { "kind": "section", "label": "EL GANCHO", "timestamp": "00:00 - 00:15", "body": "<texto hablable del gancho>" },
    { "kind": "value",   "label": "NUEVA INFORMACIÓN DE VALOR", "items": ["aporte 1", "aporte 2", "aporte 3"] },
    { "kind": "section", "label": "DESARROLLO 1", "timestamp": "00:15 - ...", "body": "<texto>" },
    { "kind": "section", "label": "DESARROLLO 2", "timestamp": "... - ...", "body": "<texto>" },
    { "kind": "section", "label": "CIERRE Y CTA", "timestamp": "... - fin", "body": "<texto>" }
  ]
}
Usa tantas secciones "section" como haga falta para cubrir la longitud objetivo (mínimo 4). Cada "body" debe ser sustancial, no una sola línea.`;

export async function generateScript(
  transcript: string,
  optimizedTitle: string
): Promise<GeneratedScript> {
  const ref = transcript.replace(/\[[^\]]*\]/g, "").trim();
  const targetChars = ref.length;

  // Con transcripción → modo "replicar estilo del original".
  // Sin transcripción (idea de canal) → modo "guion original de alta calidad".
  const userContent = ref
    ? `Transcripción del video de referencia (estúdiala):
"""
${transcript.slice(0, 14000)}
"""

Título objetivo del nuevo video para nuestro canal: "${optimizedTitle}"
Longitud objetivo del guion: ~${targetChars} caracteres (la del original).

Escribe el guion siguiendo todas las reglas del sistema y devuelve únicamente el JSON.`
    : `No hay video de referencia. Escribe un guion ORIGINAL de altísima calidad para este título de nuestro canal: "${optimizedTitle}".

Aplica todas las buenas prácticas de retención y CTR del sistema (gancho potente, loops abiertos, valor real, cierre con CTA). Longitud objetivo: entre 3500 y 6000 caracteres. Devuelve únicamente el JSON.`;

  const res = await client().chat.completions.create({
    model: TEXT_MODEL,
    temperature: 0.85,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SCRIPT_SYSTEM_PROMPT },
      { role: "user", content: userContent },
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

// ── 2b. Análisis de la miniatura original (visión) ──────────────────────────
export async function analyzeThumbnail(
  imageUrl: string
): Promise<{ title: string; description: string }[]> {
  try {
    const res = await client().chat.completions.create({
      model: TEXT_MODEL,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en diseño de miniaturas de YouTube. Analizas una miniatura y explicas qué la hace funcionar (composición, contraste, foco, texto, emoción). Respondes SOLO en JSON.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analiza esta miniatura. Devuelve JSON:
{ "insights": [ { "title": "factor (2-4 palabras)", "description": "explicación breve" } ] }
Incluye 2-3 insights accionables.`,
            },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    });
    const parsed = extractJson<{
      insights: { title: string; description: string }[];
    }>(res.choices[0]?.message?.content || "{}");
    return (parsed.insights || []).slice(0, 3);
  } catch {
    // Si el análisis visual falla (p. ej. miniatura no accesible), no rompemos.
    return [
      {
        title: "Alto Contraste",
        description: "Sujeto destacado sobre el fondo para captar la atención.",
      },
    ];
  }
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
