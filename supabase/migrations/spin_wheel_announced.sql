-- Marca cuándo se avisó por push a los clientes que la ruleta está activa (se avisa una sola vez)
alter table spin_wheel_settings
  add column if not exists announced_at timestamptz;

-- Programas que YA tienen la ruleta activa: marcarlos como avisados para no mandar
-- el push de "ya podés girar" a clientes que la conocen desde antes.
update spin_wheel_settings
  set announced_at = now()
  where enabled = true and announced_at is null;
