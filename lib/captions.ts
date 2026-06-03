// ─────────────────────────────────────────────────────────────────────────────
// Transcripción REAL a partir de los subtítulos del propio YouTube.
// No requiere API key. Devuelve el texto hablado con marcas de tiempo [MM:SS].
// Si el video no tiene subtítulos disponibles, devuelve null (y el flujo
// recurre a Gemini como respaldo).
// ─────────────────────────────────────────────────────────────────────────────

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

interface CaptionTrack {
  baseUrl: string;
  kind?: string; // "asr" = auto-generadas
  languageCode?: string;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&#34;/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim();
}

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `[${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}]`;
}

/** Extrae las pistas de subtítulos del HTML de la página del video. */
function extractTracks(html: string): CaptionTrack[] {
  const m = html.match(/"captionTracks":(\[.*?\])/);
  if (!m) return [];
  try {
    return JSON.parse(m[1]) as CaptionTrack[];
  } catch {
    return [];
  }
}

/** Convierte el XML de timedtext en texto con marcas de tiempo. */
function parseTimedText(xml: string): string {
  const matches = Array.from(
    xml.matchAll(/<text start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g)
  );
  if (matches.length === 0) return "";
  const lines = matches.map((m) => {
    const start = parseFloat(m[1]);
    const text = decodeEntities(m[2].replace(/<[^>]+>/g, ""));
    return `${fmtTime(start)} ${text}`;
  });
  return lines.filter((l) => l.replace(/\[[^\]]*\]/g, "").trim()).join("\n");
}

/**
 * Devuelve la transcripción real del video desde sus subtítulos, o null.
 */
export async function fetchYouTubeCaptions(
  videoId: string
): Promise<string | null> {
  try {
    // `bpctr` + cookie CONSENT evitan el muro de consentimiento que YouTube
    // muestra a IPs de datacenter (Vercel), donde no vendría captionTracks.
    const res = await fetch(
      `https://www.youtube.com/watch?v=${videoId}&hl=en&gl=US&bpctr=9999999999&has_verified=1`,
      {
        headers: {
          "User-Agent": UA,
          "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
          Cookie: "CONSENT=YES+cb.20210328-17-p0.en+FX+000; SOCS=CAI",
        },
      }
    );
    if (!res.ok) return null;
    const html = await res.text();

    const tracks = extractTracks(html);
    if (tracks.length === 0) return null;

    // Preferimos subtítulos manuales; si no, los auto-generados (ASR).
    const track =
      tracks.find((t) => t.kind !== "asr") || tracks[0];
    if (!track?.baseUrl) return null;

    const xmlRes = await fetch(track.baseUrl, {
      headers: { "User-Agent": UA },
    });
    if (!xmlRes.ok) return null;
    const xml = await xmlRes.text();

    const transcript = parseTimedText(xml);
    return transcript.length > 0 ? transcript : null;
  } catch {
    return null;
  }
}
