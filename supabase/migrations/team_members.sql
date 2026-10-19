-- Usuarios del equipo (plan Ultimate): personas que entran al panel con su propio usuario
-- y solo pueden dar sellos, ver clientes y canjear cupones. Se identifican por su email.
create table if not exists business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  email text not null,
  user_id uuid references auth.users(id) on delete set null,
  role text not null default 'staff' check (role in ('staff')),
  -- Si se completa, la persona solo da sellos en esa sucursal
  branch_id uuid references branches(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (business_id, email)
);

-- Sin políticas: solo el servidor (service role) puede leer y escribir esta tabla.
alter table business_members enable row level security;
