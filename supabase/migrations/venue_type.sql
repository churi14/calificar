-- Tipo de local (cómo atiende el negocio): 'local', 'sin_calle' o 'delivery'. Vacío = sin elegir.
alter table loyalty_programs
  add column if not exists venue_type text
  check (venue_type in ('local', 'sin_calle', 'delivery'));
