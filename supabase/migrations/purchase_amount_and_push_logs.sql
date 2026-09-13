-- purchase_amount en loyalty_transactions (puede ya existir)
alter table loyalty_transactions
  add column if not exists purchase_amount numeric default null;

-- Historial de pushes enviados
create table if not exists push_logs (
  id          uuid default gen_random_uuid() primary key,
  program_id  uuid references loyalty_programs(id) on delete cascade,
  title       text not null,
  body        text not null,
  sent_to     int default 0,   -- cuántos se enviaron
  created_at  timestamptz default now()
);

create index if not exists push_logs_program_idx on push_logs(program_id);
create index if not exists push_logs_created_at_idx on push_logs(created_at desc);
