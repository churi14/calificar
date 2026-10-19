-- Locales extra para el plan Pro: se suman a los 3 que incluye (los carga el administrador de Calificar).
alter table businesses
  add column if not exists extra_locales int not null default 0
  check (extra_locales between 0 and 47);
