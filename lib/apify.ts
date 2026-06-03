// ─────────────────────────────────────────────────────────────────────────────
// Transcripción de YouTube vía Apify (actor youtube-transcript-scraper).
//
// Apify ejecuta el scraping en su propia infraestructura (con proxies), por lo
// que NO sufre el bloqueo de IP de datacenter que afecta a Vercel, y devuelve
// la transcripción REAL del video.
//
// Requiere APIFY_TOKEN (ver .env.example). Actor por defecto:
//   pintostudio/youtube-transcript-scraper   →  https://apify.com/pintostudio/youtube-transcript-scraper
// ─────────────────────────────────────────────────────────────────────────────

// ID del actor pintostudio/youtube-transcript-scraper.
const ACTOR = process.env.APIFY_ACTOR || "faVsWy9VTSNVIhWpR";
// Idioma de la transcripción a solicitar (configurable). El actor requiere
// este campo; "es" por defecto para contenido en español.
const TARGET_LANG = process.env.APIFY_TARGET_LANG || "es";

export const isApifyConfigured = (): boolean => !!process.env.APIFY_TOKEN;

function fmtTime(sec: number): string {
  // El actor devuelve el inicio en segundos.
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `[${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}]`;
}

interface Segment {
  text?: string;
  start?: string | number;
  offset?: string | number;
  dur?: string | number;
  duration?: string | number;
}

/** Normaliza distintas formas de salida del actor a [{start, text}]. */
function collectSegments(items: unknown): Segment[] {
  if (!Array.isArray(items)) return [];
  const segs: Segment[] = [];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    // Forma 1: el item ya es un segmento {text, start, dur}.
    if (typeof obj.text === "string") {
      segs.push(obj as Segment);
      continue;
    }
    // Forma 2: { data: [ {text,start,dur}, ... ] }.
    const nested = obj.data || obj.transcript || obj.captions || obj.segments;
    if (Array.isArray(nested)) {
      for (const s of nested) {
        if (s && typeof s === "object") segs.push(s as Segment);
        else if (typeof s === "string") segs.push({ text: s });
      }
    } else if (typeof obj.transcript === "string") {
      // Forma 3: { transcript: "texto plano" }.
      segs.push({ text: obj.transcript });
    }
  }
  return segs;
}

function toTranscript(segs: Segment[]): string {
  const lines = segs
    .map((s) => {
      const text = (s.text || "").toString().trim();
      if (!text) return "";
      const raw = s.start ?? s.offset;
      if (raw !== undefined && raw !== null && raw !== "") {
        const n = typeof raw === "string" ? parseFloat(raw) : raw;
        if (!Number.isNaN(n)) return `${fmtTime(n)} ${text}`;
      }
      return text;
    })
    .filter(Boolean);
  return lines.join("\n");
}

/**
 * Obtiene la transcripción real de un video de YouTube usando Apify.
 * Devuelve null si no hay transcripción o el actor no devuelve datos.
 */
export async function fetchApifyTranscript(
  videoUrl: string
): Promise<string | null> {
  if (!isApifyConfigured()) {
    throw new Error("APIFY_TOKEN no configurada.");
  }

  const endpoint = `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?token=${encodeURIComponent(
    process.env.APIFY_TOKEN!
  )}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Input exacto del actor: videoUrl + targetLanguage.
    body: JSON.stringify({
      videoUrl,
      targetLanguage: TARGET_LANG,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Apify (${ACTOR}) respondió ${res.status}: ${detail.slice(0, 300)}`
    );
  }

  const items = await res.json().catch(() => null);
  const segments = collectSegments(items);
  const transcript = toTranscript(segments);
  return transcript.length > 0 ? transcript : null;
}
