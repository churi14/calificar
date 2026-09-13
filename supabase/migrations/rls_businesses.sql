-- RLS para tabla businesses
-- Cada usuario solo puede ver y editar su propio negocio

alter table businesses enable row level security;

-- Leer: solo el dueño
create policy "owner_select" on businesses
  for select using (owner_user_id = auth.uid());

-- Insertar: solo para sí mismo
create policy "owner_insert" on businesses
  for insert with check (owner_user_id = auth.uid());

-- Actualizar: solo el dueño
create policy "owner_update" on businesses
  for update using (owner_user_id = auth.uid());

-- Eliminar: solo el dueño (por seguridad)
create policy "owner_delete" on businesses
  for delete using (owner_user_id = auth.uid());
