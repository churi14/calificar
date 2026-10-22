-- Pedido de reseña en Google desde la tarjeta del cliente
-- review_state: null = todavía se le puede mostrar el aviso
--               'claimed'  = el cliente avisó que dejó la reseña (esperando captura)
--               'rewarded' = el negocio ya le cargó el sello (no se vuelve a mostrar)
alter table loyalty_cards add column if not exists review_state text;
alter table loyalty_cards add column if not exists review_claimed_at timestamptz;
