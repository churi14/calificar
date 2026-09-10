-- Agregar campo birth_date a loyalty_cards
alter table loyalty_cards
  add column if not exists birth_date date;
