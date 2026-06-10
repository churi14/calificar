-- ============================================================
-- CALIFICAR.AR — Schema Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- PROFILES (extiende auth.users)
create table public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  email       text,
  name        text,
  role        text default 'business' check (role in ('admin', 'business')),
  plan        text default 'free'     check (plan in ('free', 'basic', 'pro')),
  plan_expires_at timestamptz,
  created_at  timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Usuarios ven su propio perfil"
  on profiles for select using (auth.uid() = id);
create policy "Usuarios editan su propio perfil"
  on profiles for update using (auth.uid() = id);

-- Crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- BUSINESSES (locales de clientes)
create table public.businesses (
  id                  uuid default gen_random_uuid() primary key,
  owner_id            uuid references public.profiles(id) on delete cascade,
  name                text not null,
  slug                text unique not null,
  google_review_url   text,
  logo_url            text,
  whatsapp_number     text,
  negative_redirect   text default 'whatsapp' check (negative_redirect in ('whatsapp', 'form')),
  threshold           int  default 3,          -- estrella mínima para redirigir a Google
  primary_color       text default '#111111',
  accent_color        text default '#F59E0B',
  active              boolean default true,
  total_scans         int default 0,
  positive_scans      int default 0,
  negative_scans      int default 0,
  created_at          timestamptz default now()
);
alter table public.businesses enable row level security;
create policy "Owners ven sus negocios"
  on businesses for select using (auth.uid() = owner_id);
create policy "Owners editan sus negocios"
  on businesses for all using (auth.uid() = owner_id);
create policy "Funnel page puede leer negocio por slug (público)"
  on businesses for select using (active = true);

-- EMPLOYEES (mozos/vendedores — plan Pro)
create table public.employees (
  id          uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) on delete cascade,
  name        text not null,
  slug        text not null,
  total_scans int default 0,
  active      boolean default true,
  created_at  timestamptz default now(),
  unique(business_id, slug)
);
alter table public.employees enable row level security;
create policy "Owners gestionan empleados"
  on employees for all
  using (exists (select 1 from businesses b where b.id = business_id and b.owner_id = auth.uid()));

-- SCANS (analytics de cada escaneo)
create table public.scans (
  id          uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) on delete cascade,
  employee_id uuid references public.employees(id) on delete set null,
  rating      int,
  outcome     text check (outcome in ('positive', 'negative', 'abandoned')),
  created_at  timestamptz default now()
);
alter table public.scans enable row level security;
create policy "Insertar scan (anónimo)"
  on scans for insert with check (true);
create policy "Owners ven sus scans"
  on scans for select
  using (exists (select 1 from businesses b where b.id = business_id and b.owner_id = auth.uid()));

-- FEEDBACK PRIVADO (de clientes insatisfechos)
create table public.feedback (
  id          uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) on delete cascade,
  rating      int,
  message     text,
  contact     text,    -- email o teléfono opcional
  read        boolean default false,
  created_at  timestamptz default now()
);
alter table public.feedback enable row level security;
create policy "Insertar feedback (anónimo)"
  on feedback for insert with check (true);
create policy "Owners ven su feedback"
  on feedback for all
  using (exists (select 1 from businesses b where b.id = business_id and b.owner_id = auth.uid()));

-- AI RESPONSES (historial de respuestas generadas)
create table public.ai_responses (
  id          uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) on delete cascade,
  review_text text,
  response    text,
  used        boolean default false,
  created_at  timestamptz default now()
);
alter table public.ai_responses enable row level security;
create policy "Owners gestionan sus respuestas IA"
  on ai_responses for all
  using (exists (select 1 from businesses b where b.id = business_id and b.owner_id = auth.uid()));

-- ÍNDICES
create index on scans(business_id, created_at desc);
create index on scans(business_id, outcome);
create index on feedback(business_id, read, created_at desc);
create index on businesses(slug);
create index on employees(business_id, slug);

-- FUNCIÓN helper: contar plan limits
create or replace function get_plan_limits(plan_name text)
returns jsonb language sql as $$
  select case plan_name
    when 'free'  then '{"businesses": 1, "ai_responses_month": 10, "employees": 2}'::jsonb
    when 'basic' then '{"businesses": 3, "ai_responses_month": 100, "employees": 10}'::jsonb
    when 'pro'   then '{"businesses": 999, "ai_responses_month": 999, "employees": 999}'::jsonb
    else '{"businesses": 1, "ai_responses_month": 10, "employees": 2}'::jsonb
  end;
$$;
