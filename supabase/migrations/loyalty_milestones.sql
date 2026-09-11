-- Milestones intermedios por programa
-- Formato: [{"at": 3, "label": "20% OFF", "coupon_prefix": "DESC20"}, ...]
alter table loyalty_programs
  add column if not exists milestones jsonb default '[]'::jsonb;
