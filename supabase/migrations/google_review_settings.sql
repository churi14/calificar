-- Configuración del potenciador de reseñas Google por programa
create table if not exists google_review_settings (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references loyalty_programs(id) on delete cascade unique,
  enabled boolean not null default false,
  google_maps_url text,
  push_title text not null default '¡Ganaste tu premio! 🏆',
  push_body  text not null default '¿Te gustó? Tu opinión nos ayuda mucho. ¡Dejanos una reseña en Google!',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table google_review_settings enable row level security;
create policy "service role full access" on google_review_settings
  using (true) with check (true);
