// ─────────────────────────────────────────────────────────────────────────────
// MODO DEMO
// Generadores de datos simulados. Todo lo que devuelven estas funciones está
// pensado para ser reemplazado por llamadas reales a un proveedor de IA
// (Anthropic / OpenAI) cuando se configure la API key.
//
// Para conectar IA real, ver los TODO en:
//   app/api/analyze/route.ts
//   app/api/script/route.ts
//   app/api/channel/route.ts
// ─────────────────────────────────────────────────────────────────────────────

import { thumbnailFor } from "./youtube";
import type {
  ChannelAnalysis,
  ChannelVideoIdea,
  GeneratedScript,
  VideoAnalysis,
} from "./types";

const TITLE_PREFIXES = [
  "De Cero a {x}: El Mapa Real que Nadie te Cuenta",
  "El Método de 90 Días para {x} (Sin Rodeos)",
  "Lo que Aprendí sobre {x} y Cambió Todo",
  "{x}: La Estrategia que Usan los Pros en 2025",
  "Nadie te Dijo Esto sobre {x} (Hasta Ahora)",
];

const VIRALITY: ChannelVideoIdea["virality"][] = ["ALTA", "CRÍTICA", "MEDIA"];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Genera el análisis de un video (título optimizado + miniatura). */
export function mockVideoAnalysis(
  sourceUrl: string,
  videoId: string | null
): VideoAnalysis {
  const seed = hashString(sourceUrl || "creatorlens");
  const topic = videoId ? "Programar" : "tu Tema";
  const optimized = pick(TITLE_PREFIXES, seed).replace("{x}", topic);

  return {
    videoId,
    sourceUrl,
    title: {
      original: "Cómo aprendí a programar en 3 meses desde cero",
      optimized,
      score: 88 + (seed % 11), // 88–98
      styleTags: [
        { label: "Gancho emocional", icon: "favorite" },
        { label: "Curiosidad", icon: "help" },
        { label: "Urgencia", icon: "bolt" },
      ],
    },
    thumbnail: {
      imageUrl: thumbnailFor(videoId),
      insights: [
        {
          title: "Composición de Alto Contraste",
          description:
            "Sujeto iluminado con luz de contorno para destacar sobre el fondo neutro.",
        },
        {
          title: "Jerarquía Visual",
          description: "Texto minimalista en la zona de mayor impacto visual.",
        },
        {
          title: "Emoción Facial",
          description:
            "Expresión de sorpresa controlada que aumenta el CTR en nichos educativos.",
        },
      ],
    },
  };
}

/** Genera un guion adaptado para un título dado. */
export function mockScript(title: string): GeneratedScript {
  return {
    title,
    blocks: [
      {
        kind: "angle",
        label: "NUEVO ÁNGULO: LA TRAMPA DE LA SINTAXIS",
        body: "\"La mayoría de la gente cree que aprender a programar es memorizar comandos. Pero después de 90 días, me di cuenta de que el verdadero secreto no es el código...\"",
      },
      {
        kind: "section",
        label: "EL GANCHO",
        timestamp: "00:00 - 00:15",
        body: "\"¿Alguna vez has sentido que estás atrapado en el 'tutorial hell'? Pasas horas viendo videos pero no puedes escribir ni una línea solo. Yo estuve ahí. En 3 meses pasé de no saber qué era un terminal a construir mi primera App. Y no fue porque fuera un genio, fue porque cambié estas 3 cosas que nadie te dice.\"",
      },
      {
        kind: "value",
        label: "NUEVA INFORMACIÓN DE VALOR",
        items: [
          "Introducir el concepto de \"Deep Work\" aplicado a bloques de código.",
          "Comparativa de ecosistemas 2025 (Por qué JavaScript ya no es la única entrada).",
          "El secreto de la documentación: cómo leerla sin morir en el intento.",
        ],
      },
      {
        kind: "section",
        label: "LA REVELACIÓN",
        timestamp: "00:45 - 02:00",
        body: "\"Verás, el 90% de los cursos te enseñan a copiar. Pero si quieres una carrera real, necesitas entender la lógica de negocio. Aquí es donde entra el proyecto ancla. En lugar de hacer 10 calculadoras, vamos a construir una herramienta que tú mismo uses todos los días...\"",
      },
      {
        kind: "section",
        label: "EL CIERRE / LLAMADA A LA ACCIÓN",
        timestamp: "08:00 - 09:00",
        body: "\"Si llegaste hasta aquí, ya estás por delante del 95%. Deja en los comentarios cuál de estas 3 cosas vas a aplicar esta semana, y suscríbete porque el próximo video es el roadmap completo paso a paso.\"",
      },
    ],
  };
}

const DEMO_CHANNEL_TITLES = [
  "Cómo organizar tu entorno de desarrollo para máxima productividad",
  "Por qué dejarás de ser junior después de ver este video",
  "El futuro del código: IA vs Desarrolladores en 2025",
  "Roadmap completo de Backend desde cero",
  "Mi setup minimalista para programar en 2025",
  "No aprendas Python sin saber esto primero",
  "Cómo ganar $1000/mes como freelance",
  "JavaScript vs TypeScript: cuál elegir en 2025",
  "Entrevista mock: de junior a mid-level en vivo",
];

/** Genera el análisis de un canal con una cuadrícula de 9 ideas de video. */
export function mockChannelAnalysis(channelName: string): ChannelAnalysis {
  const seed = hashString(channelName || "canal");
  const videos: ChannelVideoIdea[] = DEMO_CHANNEL_TITLES.map((title, i) => ({
    id: `${seed}-${i}`,
    title,
    thumbnailUrl: `https://picsum.photos/seed/${seed + i}/640/360`,
    virality: pick(VIRALITY, seed + i),
  }));

  return {
    id: `${seed}-${Date.now()}`,
    channelName: channelName || "Canal sin nombre",
    createdAt: Date.now(),
    adaptedTitle: pick(TITLE_PREFIXES, seed).replace("{x}", "tu Nicho"),
    thumbnailStyle:
      "Alto contraste, rostro expresivo a la izquierda, texto de 3 palabras a la derecha, paleta fría con acento cálido.",
    videos,
  };
}
