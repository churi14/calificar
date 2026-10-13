-- Sistema de referencias digitales

-- 1. ref_code único por tarjeta (para compartir el link de referido)
alter table loyalty_cards
  add column if not exists ref_code text unique;

-- Generar códigos para tarjetas existentes que no tengan
update loyalty_cards
set ref_code = substring(md5(id::text || random()::text) from 1 for 8)
where ref_code is null;

-- 2. Guardar quién refirió a quién
alter table loyalty_cards
  add column if not exists referred_by_card_id uuid references loyalty_cards(id) on delete set null;

-- 3. Configuración por programa
create table if not exists referral_settings (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references loyalty_programs(id) on delete cascade unique,
  enabled boolean not null default false,
  referrer_stamps int not null default 2,   -- sellos para quien refiere
  referred_stamps int not null default 1,   -- sellos para el nuevo cliente
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table referral_settings enable row level security;
create policy "service role full access" on referral_settings
  using (true) with check (true);
