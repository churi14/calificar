-- Tabla de donaciones para desbloquear QRs ilimitados
CREATE TABLE IF NOT EXISTS public.donations (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid        REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  method        text        NOT NULL, -- 'cafecito' | 'usdt' | 'eth' | 'btc'
  amount_ars    integer,              -- monto aproximado declarado por el usuario
  reference     text,                 -- email de cafecito o tx hash de cripto
  status        text        NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  created_at    timestamptz DEFAULT now(),
  reviewed_at   timestamptz
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- El usuario puede insertar y ver sus propias donaciones
CREATE POLICY "donations_own_insert" ON public.donations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "donations_own_read"   ON public.donations FOR SELECT USING (user_id = auth.uid());

-- Flag de QRs ilimitados en el perfil del usuario
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS qr_unlimited boolean DEFAULT false;
