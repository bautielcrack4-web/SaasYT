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

1. **OpenAI (texto + imágenes)** — ya integrado en `lib/openai.ts`:
   - **Título**: GPT desglosa el estilo y optimiza el título (`/api/analyze`).
   - **Guion**: GPT analiza la transcripción, replica estilo y longitud exacta
     y adapta a tu canal (`/api/script`).
   - **Miniatura**: `gpt-image-2` analiza la imagen de referencia y genera una
     nueva (mismo estilo, distinto texto/ángulo), quality `low`, 16:9
     (`/api/thumbnail`).
   - **Canal**: GPT visión analiza la captura y genera 9 ideas (`/api/channel`).
   Define `OPENAI_API_KEY` (ver `.env.example`). Sin key → modo demo.
1. **Transcripción de video** — integrada con **Google Gemini 3 Flash** vía
   Replicate (`lib/transcribe.ts`, `app/api/transcribe`). Define
   `REPLICATE_API_TOKEN`; sin token funciona en modo demo.
2. **Miniaturas** — añade generación/restyle de imagen en `/api/analyze`.
3. **Supabase** — instala `@supabase/supabase-js @supabase/ssr`, ejecuta
   `supabase/schema.sql`, define las variables `NEXT_PUBLIC_SUPABASE_*` y migra
   `lib/history.ts` a las tablas. El scaffold está en `lib/supabase.ts`.

## Deploy en Vercel

Importa el repo en Vercel. No requiere variables de entorno para el modo demo.
