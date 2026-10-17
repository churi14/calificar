-- Sucursales: locales dentro de un mismo programa. La tarjeta del cliente es compartida;
-- cada sello guarda en qué sucursal se dio (branch_id) para sacar métricas por local.
-- branch_id NULL = sucursal "Principal" (todo lo anterior a esta migración).
create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references loyalty_programs(id) on delete cascade,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists branches_program_idx on branches (program_id) where active;

alter table branches enable row level security;
create policy "service role full access" on branches using (true) with check (true);

alter table loyalty_transactions
  add column if not exists branch_id uuid references branches(id) on delete set null;

create index if not exists loyalty_transactions_branch_idx
  on loyalty_transactions (program_id, branch_id, created_at desc);
