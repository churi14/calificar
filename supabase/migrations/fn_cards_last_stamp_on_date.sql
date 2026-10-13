-- Retorna los card_id cuyo último sello en el programa fue en la fecha dada
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
  having max(t.created_at)::date = p_date
$$;
