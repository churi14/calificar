-- Hora de envío configurable para la reactivación automática (hora de Argentina, 0-23)
alter table reactivation_campaigns
  add column if not exists send_hour int not null default 10
  check (send_hour between 0 and 23);

-- "Último sello en la fecha dada" ahora se mide en hora de Argentina (antes era UTC).
-- Sin esto, un sello a las 22:00 del local contaba como del día siguiente.
create or replace function cards_last_stamp_on_date(
  p_program_id uuid,
  p_date       date
)
returns table(card_id uuid)
language sql
stable
security definer
as $$
  select t.card_id
  from loyalty_transactions t
  where t.program_id = p_program_id
    and t.type = 'stamp'
    and t.card_id is not null
  group by t.card_id
  having (max(t.created_at) at time zone 'America/Argentina/Buenos_Aires')::date = p_date
$$;
