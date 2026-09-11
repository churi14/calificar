-- Tracking de funnel del onboarding de fidelización
-- Registra cada interacción anónima para ver dónde abandona la gente

create table if not exists onboarding_events (
  id          uuid        default gen_random_uuid() primary key,
  session_id  text        not null,               -- UUID generado en el browser (localStorage)
  step        int,                                -- 0-11
  step_name   text,                              -- 'tipo_negocio', 'sellos', etc.
  event       text        not null,              -- 'step_view' | 'select' | 'step_complete' | 'auth_click' | 'registered'
  data        jsonb,                             -- qué eligió: { value: 'cafeteria' } etc.
  user_agent  text,
  created_at  timestamptz default now()
);

-- Index para queries de funnel
create index if not exists onboarding_events_session_idx  on onboarding_events(session_id);
create index if not exists onboarding_events_step_idx     on onboarding_events(step);
create index if not exists onboarding_events_event_idx    on onboarding_events(event);
create index if not exists onboarding_events_created_idx  on onboarding_events(created_at desc);
