-- Vincular negocios a usuarios de Supabase Auth
-- Permite el onboarding self-service: al registrarse, el negocio queda en su cuenta

alter table businesses
  add column if not exists owner_user_id uuid references auth.users(id) on delete set null;

create index if not exists businesses_owner_user_id_idx
  on businesses(owner_user_id);

-- Opcional: permitir al dueño leer su propio negocio con RLS
-- (solo si tenés RLS activo en la tabla businesses)
-- create policy "Owner can view own business"
--   on businesses for select
--   using (owner_user_id = auth.uid());
