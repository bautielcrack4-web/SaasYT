# CreatorLens AI

SaaS para creadores de YouTube con estética **glassmorphism estilo iOS**. Pega el
link de un video y la IA genera un **título optimizado**, un **análisis de
miniatura** y un **guion adaptado** a tu canal. También puedes **analizar un
canal** (subiendo una captura) para obtener una cuadrícula de **9 ideas de
video**, y todo queda guardado en el **historial**.

> **Estado actual: MODO DEMO.** Toda la generación usa datos simulados. La
> arquitectura ya está lista para conectar IA real y Supabase sin tocar la UI.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** con el design system "Luminous Precision"
- Listo para desplegar en **Vercel**

## Desarrollo

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Estructura

```
app/
  page.tsx              Dashboard: analizar un video
  create-channel/       Chat con IA: analizar un canal (captura) → 9 videos
  history/              Historial de canales guardados
  api/
    analyze/            Título + miniatura  (mock → IA real)
    script/             Guion adaptado       (mock → IA real)
    channel/            Análisis de canal    (mock → IA real)
components/             UI (tarjetas glass, grid, chat, etc.)
lib/
  mock.ts               Generadores demo (reemplazar por IA)
  history.ts            Historial (localStorage → Supabase)
  supabase.ts           Scaffold de Supabase (desactivado)
  youtube.ts            Extracción de ID + miniaturas públicas
supabase/schema.sql     Esquema para activar persistencia
```

## Cómo pasar de demo a producción

1. **IA de texto** — en `app/api/analyze`, `app/api/script` y `app/api/channel`
   reemplaza las llamadas a `lib/mock.ts` por llamadas a Anthropic/OpenAI.
   Define `ANTHROPIC_API_KEY` u `OPENAI_API_KEY` (ver `.env.example`).
1. **Transcripción de video** — ya integrada con **Google Gemini 3 Flash** vía
   Replicate (`lib/transcribe.ts`, `app/api/transcribe`). Define
   `REPLICATE_API_TOKEN` y al generar un guion se usará la transcripción real
   del video; sin token funciona en modo demo.
2. **Miniaturas** — añade generación/restyle de imagen en `/api/analyze`.
3. **Supabase** — instala `@supabase/supabase-js @supabase/ssr`, ejecuta
   `supabase/schema.sql`, define las variables `NEXT_PUBLIC_SUPABASE_*` y migra
   `lib/history.ts` a las tablas. El scaffold está en `lib/supabase.ts`.

## Deploy en Vercel

Importa el repo en Vercel. No requiere variables de entorno para el modo demo.
