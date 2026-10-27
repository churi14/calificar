-- Modo "solo sella el negocio" (plan Pro): el QR y el link del local dejan de sumar sellos al cliente;
-- los sellos se cargan desde el panel. Además, el tiempo mínimo entre sellos de una misma tarjeta es configurable:
--   'h4'  = 4 horas (como era hasta ahora)   'h12' = 12 horas   'day' = 1 por día (se reinicia 00:00 de Argentina)
alter table loyalty_programs
  add column if not exists business_only_stamps boolean not null default false;

alter table loyalty_programs
  add column if not exists stamp_interval text not null default 'h4';

alter table loyalty_programs
  drop constraint if exists loyalty_programs_stamp_interval_check;
alter table loyalty_programs
  add constraint loyalty_programs_stamp_interval_check check (stamp_interval in ('h4', 'h12', 'day'));
