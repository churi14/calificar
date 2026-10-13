-- Configuración de campañas de reactivación automática por programa
create table if not exists reactivation_campaigns (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references loyalty_programs(id) on delete cascade unique,
  enabled boolean not null default false,

  -- Triggers configurables (días sin visita)
  trigger_5_enabled  boolean not null default true,
  trigger_15_enabled boolean not null default true,
  trigger_30_enabled boolean not null default false,

  -- Mensajes personalizables por trigger
  message_5  text,
  message_15 text,
  message_30 text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table reactivation_campaigns enable row level security;
create policy "service role full access" on reactivation_campaigns
  using (true) with check (true);

-- Log para no reenviar el mismo trigger al mismo cliente en el mismo día
create table if not exists reactivation_logs (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references loyalty_cards(id) on delete cascade,
  program_id uuid not null references loyalty_programs(id) on delete cascade,
  trigger_days int not null,  -- 5, 15 o 30
  sent_at timestamptz not null default now(),
);

create unique index if not exists reactivation_logs_daily_unique
  on reactivation_logs (card_id, program_id, trigger_days, (sent_at::date));

alter table reactivation_logs enable row level security;
create policy "service role full access" on reactivation_logs
  using (true) with check (true);
