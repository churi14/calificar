-- Modo delivery / dark kitchen: si está activado, los sellos por auto-sello solo se dan con el
-- link de un solo uso que el negocio manda por cada pedido (el QR y el link fijos dejan de dar sellos).
alter table loyalty_programs
  add column if not exists require_stamp_token boolean not null default false;
