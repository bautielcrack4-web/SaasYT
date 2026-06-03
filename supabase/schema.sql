-- ─────────────────────────────────────────────────────────────
-- Esquema de Supabase para CreatorLens AI (para activar más adelante).
-- Ejecutar en el SQL Editor del proyecto cuando se conecte Supabase.
-- Hoy la app usa localStorage (lib/history.ts); este esquema es el destino.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  channel_name text not null,
  adapted_title text,
  thumbnail_style text,
  videos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.channels enable row level security;

-- Cada usuario solo ve y gestiona sus propios canales.
create policy "channels_select_own" on public.channels
  for select using (auth.uid() = user_id);

create policy "channels_insert_own" on public.channels
  for insert with check (auth.uid() = user_id);

create policy "channels_delete_own" on public.channels
  for delete using (auth.uid() = user_id);

create index if not exists channels_user_created_idx
  on public.channels (user_id, created_at desc);
