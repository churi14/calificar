-- Tabla de feedback negativo enriquecido
-- Correr en Supabase SQL Editor

create table if not exists public.feedback (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  business_id   uuid not null references public.businesses(id) on delete cascade,
  employee_id   uuid references public.employees(id) on delete set null,
  rating        int not null check (rating between 1 and 5),
  message       text,

  -- Datos opcionales del cliente
  nombre        text,
  email         text,
  whatsapp      text,
  photo_url     text,   -- URL del archivo en Supabase Storage

  -- Control de lectura
  read          boolean default false,
  responded_at  timestamptz
);

-- Índices
create index if not exists feedback_business_id_idx on public.feedback(business_id);
create index if not exists feedback_created_at_idx  on public.feedback(created_at desc);
create index if not exists feedback_read_idx         on public.feedback(read) where read = false;

-- RLS
alter table public.feedback enable row level security;

-- El dueño del negocio puede leer su propio feedback
create policy "business owner can read feedback"
  on public.feedback for select
  using (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );

-- El sistema (service role) puede insertar
create policy "service role can insert feedback"
  on public.feedback for insert
  with check (true);

-- El dueño puede marcar como leído
create policy "business owner can update feedback"
  on public.feedback for update
  using (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );

-- Storage bucket para fotos de feedback
insert into storage.buckets (id, name, public)
values ('feedback-photos', 'feedback-photos', true)
on conflict do nothing;

-- Política de storage: cualquiera puede subir (el cliente no está autenticado)
create policy "public upload feedback photos"
  on storage.objects for insert
  with check (bucket_id = 'feedback-photos');

-- Política de storage: cualquiera puede leer (las fotos son públicas)
create policy "public read feedback photos"
  on storage.objects for select
  using (bucket_id = 'feedback-photos');
