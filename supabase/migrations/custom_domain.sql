-- Dominio personalizado por programa (Ultimate)
alter table loyalty_programs
  add column if not exists custom_domain text unique,
  add column if not exists custom_domain_verified boolean not null default false,
  add column if not exists custom_domain_added_at timestamptz;

-- Índice para búsqueda rápida en middleware
create index if not exists idx_loyalty_programs_custom_domain
  on loyalty_programs (custom_domain)
  where custom_domain is not null;
