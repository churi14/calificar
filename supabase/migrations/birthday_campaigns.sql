-- Configuración de campaña de cumpleaños por programa
create table if not exists birthday_campaigns (
  id              uuid default gen_random_uuid() primary key,
  program_id      uuid references loyalty_programs(id) on delete cascade unique,
  enabled         boolean default false,
  discount_type   text default 'percent',   -- 'percent' | 'fixed'
  discount_value  int default 20,           -- ej: 20 = 20% off
  message_day0    text,  -- Mensaje el día del cumpleaños
  message_mid     text,  -- Recordatorio a los 15 días
  message_last    text,  -- Último aviso a los 25 días
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Códigos de cumpleaños generados por cliente/año
create table if not exists birthday_coupons (
  id          uuid default gen_random_uuid() primary key,
  card_id     uuid references loyalty_cards(id) on delete cascade,
  program_id  uuid references loyalty_programs(id) on delete cascade,
  coupon_code text not null unique,
  year        int not null,          -- para no generar dos veces el mismo año
  valid_from  date not null,
  valid_until date not null,         -- valid_from + 30 días
  used_at     timestamptz,
  notified_day0  boolean default false,
  notified_mid   boolean default false,
  notified_last  boolean default false,
  created_at  timestamptz default now(),
  unique(card_id, year)
);

create index if not exists birthday_coupons_program_idx on birthday_coupons(program_id);
create index if not exists birthday_coupons_valid_until_idx on birthday_coupons(valid_until);
