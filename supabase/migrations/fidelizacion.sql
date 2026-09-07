-- ============================================================
-- SISTEMA DE FIDELIZACIÓN — Calificar
-- Correr en Supabase > SQL Editor
-- ============================================================

-- Programa de fidelización por negocio
-- Un negocio tiene un solo programa activo
CREATE TABLE IF NOT EXISTS loyalty_programs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     uuid REFERENCES businesses(id) ON DELETE CASCADE,
  name            text NOT NULL DEFAULT 'Programa de puntos',
  description     text,
  logo_url        text,
  cover_url       text,
  color_primary   text NOT NULL DEFAULT '#7C3AED',
  color_secondary text NOT NULL DEFAULT '#FFFFFF',
  -- Tipo: 'stamps' (sellos) o 'points' (puntos por monto)
  type            text NOT NULL DEFAULT 'stamps' CHECK (type IN ('stamps', 'points')),
  -- Para stamps: cuántos sellos para el premio
  stamps_goal     int NOT NULL DEFAULT 10,
  -- Para points: cuántos pesos = 1 punto
  points_per_peso numeric(10,2),
  -- Premio que reciben al llegar a la meta
  reward_description text NOT NULL DEFAULT 'Premio sorpresa',
  -- Coordenadas para geo-notificación de Google Wallet
  lat             numeric(10,7),
  lng             numeric(10,7),
  address         text,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Tarjeta de un cliente en un programa
CREATE TABLE IF NOT EXISTS loyalty_cards (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id      uuid REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  -- El cliente puede estar sin cuenta de Supabase (solo con teléfono)
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  phone           text,
  name            text,
  email           text,
  -- Progreso actual
  stamps          int NOT NULL DEFAULT 0,
  points          numeric(10,2) NOT NULL DEFAULT 0,
  total_visits    int NOT NULL DEFAULT 0,
  -- Google Wallet pass ID para actualizar el pase
  wallet_object_id text,
  -- Push subscription (web push)
  push_endpoint   text,
  push_p256dh     text,
  push_auth       text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (program_id, phone)
);

-- Historial de cada transacción (sello o puntos)
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id         uuid REFERENCES loyalty_cards(id) ON DELETE CASCADE,
  program_id      uuid REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  type            text NOT NULL CHECK (type IN ('stamp', 'points', 'reward', 'promo')),
  -- Cuántos sellos/puntos sumó o restó (negativo = canje)
  amount          numeric(10,2) NOT NULL DEFAULT 1,
  -- Monto de compra en pesos (para sistema de puntos)
  purchase_amount numeric(10,2),
  note            text,
  -- Quién lo registró (empleado del negocio o sistema NFC)
  registered_by   text DEFAULT 'nfc',
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Campañas de promociones del negocio
CREATE TABLE IF NOT EXISTS loyalty_promotions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id      uuid REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  title           text NOT NULL,
  body            text NOT NULL,
  image_url       text,
  -- 'all' o 'individual'
  target          text NOT NULL DEFAULT 'all' CHECK (target IN ('all', 'individual')),
  -- Si target='individual', el card_id destino
  target_card_id  uuid REFERENCES loyalty_cards(id) ON DELETE SET NULL,
  -- Estado del envío
  status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'failed')),
  sent_at         timestamptz,
  sent_count      int DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_loyalty_cards_program ON loyalty_cards(program_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_cards_phone ON loyalty_cards(phone);
CREATE INDEX IF NOT EXISTS idx_loyalty_cards_user ON loyalty_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_card ON loyalty_transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_promotions_program ON loyalty_promotions(program_id);

-- RLS (Row Level Security)
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_promotions ENABLE ROW LEVEL SECURITY;

-- Policies: el dueño del negocio ve su programa
CREATE POLICY "business owner manages program"
  ON loyalty_programs FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- El cliente ve su propia tarjeta
CREATE POLICY "card owner reads own card"
  ON loyalty_cards FOR SELECT
  USING (user_id = auth.uid());

-- El dueño del negocio ve todas las tarjetas de su programa
CREATE POLICY "business owner reads cards"
  ON loyalty_cards FOR ALL
  USING (
    program_id IN (
      SELECT lp.id FROM loyalty_programs lp
      JOIN businesses b ON b.id = lp.business_id
      WHERE b.owner_id = auth.uid()
    )
  );

-- El cliente ve su historial
CREATE POLICY "card owner reads transactions"
  ON loyalty_transactions FOR SELECT
  USING (
    card_id IN (SELECT id FROM loyalty_cards WHERE user_id = auth.uid())
  );

-- El dueño del negocio gestiona transacciones y promociones
CREATE POLICY "business owner manages transactions"
  ON loyalty_transactions FOR ALL
  USING (
    program_id IN (
      SELECT lp.id FROM loyalty_programs lp
      JOIN businesses b ON b.id = lp.business_id
      WHERE b.owner_id = auth.uid()
    )
  );

CREATE POLICY "business owner manages promotions"
  ON loyalty_promotions FOR ALL
  USING (
    program_id IN (
      SELECT lp.id FROM loyalty_programs lp
      JOIN businesses b ON b.id = lp.business_id
      WHERE b.owner_id = auth.uid()
    )
  );

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER loyalty_programs_updated_at
  BEFORE UPDATE ON loyalty_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER loyalty_cards_updated_at
  BEFORE UPDATE ON loyalty_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
