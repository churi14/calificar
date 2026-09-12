-- Campos de avisos de proximidad en loyalty_programs
alter table loyalty_programs
  add column if not exists proximity_message text,
  add column if not exists location_lat      double precision,
  add column if not exists location_lng      double precision,
  add column if not exists location_label    text,   -- ej: "Encina 2818, Ushuaia"
  add column if not exists proximity_enabled boolean default false;
