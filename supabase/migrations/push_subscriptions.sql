-- Suscripciones Web Push para fidelización
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references loyalty_cards(id) on delete cascade,
  program_id uuid not null references loyalty_programs(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique(card_id, endpoint)
);

alter table push_subscriptions enable row level security;

-- Solo el service role puede leer/escribir
create policy "service role full access" on push_subscriptions
  using (true) with check (true);
