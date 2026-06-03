// ─────────────────────────────────────────────────────────────────────────────
// SCAFFOLD DE SUPABASE  (aún NO conectado — modo demo)
//
// La app funciona hoy con localStorage (ver lib/history.ts) y datos demo.
// Cuando quieras activar auth + historial persistente por usuario:
//
//   1. npm install @supabase/supabase-js @supabase/ssr
//   2. Crear el proyecto en Supabase y ejecutar supabase/schema.sql
//   3. Definir en Vercel / .env.local:
//        NEXT_PUBLIC_SUPABASE_URL=...
//        NEXT_PUBLIC_SUPABASE_ANON_KEY=...
//   4. Descomentar la implementación de abajo y migrar lib/history.ts
//      a las tablas de Supabase.
//
// Se deja como referencia para no romper el build en modo demo.
// ─────────────────────────────────────────────────────────────────────────────

export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/*
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
*/
