-- Ruleta de la suerte

create table if not exists spin_wheel_settings (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references loyalty_programs(id) on delete cascade unique,
  enabled boolean not null default false,
  frequency text not null default 'daily',   -- 'daily' | 'weekly'
  -- prizes: [{ id, label, type ('stamps'|'coupon'|'none'), value, probability, color, coupon_prefix? }]
  prizes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table spin_wheel_settings enable row level security;
create policy "service role full access" on spin_wheel_settings
  using (true) with check (true);

create table if not exists spin_wheel_history (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references loyalty_cards(id) on delete cascade,
  program_id uuid not null references loyalty_programs(id) on delete cascade,
  prize_label text not null,
  prize_type text not null,   -- 'stamps' | 'coupon' | 'none'
  prize_value int not null default 0,
  coupon_code text,
  spun_at timestamptz not null default now()
);

create index if not exists spin_wheel_history_card_program
  on spin_wheel_history(card_id, program_id, spun_at desc);

alter table spin_wheel_history enable row level security;
create policy "service role full access" on spin_wheel_history
  using (true) with check (true);
