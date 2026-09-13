-- Sistema de planes por negocio
-- plan: 'trial' | 'starter' | 'pro' | 'ultimate' | 'gifted'
-- plan_expires_at: null = nunca vence (gifted/ultimate manual) | fecha = suscripción mensual

alter table businesses
  add column if not exists plan text not null default 'trial',
  add column if not exists plan_expires_at timestamptz,
  add column if not exists billing_notes text;  -- notas internas del admin (ej: "Pagó $19.99 via MP 12/sep")

-- Index para queries de expiración
create index if not exists businesses_plan_expires_idx on businesses(plan_expires_at);
