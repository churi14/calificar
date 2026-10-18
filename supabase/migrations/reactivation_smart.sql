-- Reactivación "según la frecuencia de cada cliente".
-- Calcula cada cuántos días suele venir cada cliente (promedio entre sus últimas visitas) y le avisa
-- cuando pasa más tiempo del normal, en vez de usar los mismos 5/15/30 días para todos.

alter table reactivation_campaigns
  add column if not exists smart_enabled boolean not null default false,
  add column if not exists smart_factor  numeric not null default 2
    check (smart_factor between 1.2 and 5),
  add column if not exists smart_message text;

-- Clientes que ya pasaron su frecuencia habitual.
--  · Una "visita" es un día con sello (hora de Argentina); se usan las últimas 6.
--  · Hacen falta al menos p_min_visits visitas para conocer su ritmo.
--  · Se avisa cuando los días sin venir >= max(p_min_days, frecuencia × p_factor).
--  · p_grace_days evita avisarle de golpe a quienes se perdieron hace mucho al activar la función.
create or replace function cards_overdue(
  p_program_id uuid,
  p_factor     numeric default 2,
  p_min_days   int     default 7,
  p_min_visits int     default 3,
  p_grace_days int     default 7
)
returns table(card_id uuid, name text, avg_gap numeric, days_since int, last_stamp timestamptz)
language sql
stable
security definer
as $$
  with visit_days as (
    select t.card_id,
           (t.created_at at time zone 'America/Argentina/Buenos_Aires')::date as d,
           max(t.created_at) as last_at
    from loyalty_transactions t
    where t.program_id = p_program_id
      and t.type = 'stamp'
      and t.card_id is not null
    group by 1, 2
  ),
  ranked as (
    select v.*, row_number() over (partition by v.card_id order by v.d desc) as rn
    from visit_days v
  ),
  agg as (
    select r.card_id,
           count(*)      as n,
           max(r.d)      as last_d,
           min(r.d)      as first_d,
           max(r.last_at) as last_at
    from ranked r
    where r.rn <= 6
    group by r.card_id
  ),
  calc as (
    select a.card_id, a.n, a.last_at,
           (a.last_d - a.first_d)::numeric / (a.n - 1) as avg_gap,
           ((now() at time zone 'America/Argentina/Buenos_Aires')::date - a.last_d) as days_since
    from agg a
    where a.n >= greatest(2, p_min_visits)
  )
  select c.card_id, k.name, round(c.avg_gap, 1), c.days_since::int, c.last_at
  from calc c
  join loyalty_cards k on k.id = c.card_id
  where c.days_since >= greatest(p_min_days, ceil(c.avg_gap * p_factor))
    and c.days_since <= greatest(p_min_days, ceil(c.avg_gap * p_factor)) + p_grace_days
$$;
