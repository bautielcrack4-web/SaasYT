// Almacenamiento del historial de canales.
//
// MODO DEMO: usa localStorage del navegador. Cuando se conecte Supabase,
// reemplazar estas funciones por consultas a la tabla `channels` (ver
// lib/supabase.ts y supabase/schema.sql). La interfaz se mantiene igual
// para que los componentes no cambien.

import type { ChannelAnalysis } from "./types";

const KEY = "creatorlens.history.v1";

export function getHistory(): ChannelAnalysis[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChannelAnalysis[];
    return parsed.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export function saveChannel(channel: ChannelAnalysis): void {
  if (typeof window === "undefined") return;
  const current = getHistory().filter((c) => c.id !== channel.id);
  const next = [channel, ...current].slice(0, 50);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function getChannel(id: string): ChannelAnalysis | undefined {
  return getHistory().find((c) => c.id === id);
}

export function deleteChannel(id: string): void {
  if (typeof window === "undefined") return;
  const next = getHistory().filter((c) => c.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}
