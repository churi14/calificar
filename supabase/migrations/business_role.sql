-- Agregar rol 'business' y relación con negocio en profiles
alter table profiles
  add column if not exists business_id uuid references businesses(id) on delete set null;

-- El campo role ya existe con 'admin'/'user', solo documentamos que ahora también acepta 'business'
-- No hay constraint de check en role por ahora, así que no necesita ALTER

-- Índice para buscar rápido por business_id
create index if not exists profiles_business_id_idx on profiles(business_id);
