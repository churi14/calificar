-- Tabla para el sistema de QR dinámicos (venta por mayor)
CREATE TABLE IF NOT EXISTS public.qr_redirects (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  code          text        UNIQUE NOT NULL,
  business_name text,
  google_url    text,
  activated     boolean     DEFAULT false,
  scan_count    integer     DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  activated_at  timestamptz
);

-- Índice para búsqueda rápida por código
CREATE INDEX IF NOT EXISTS qr_redirects_code_idx ON public.qr_redirects (code);

-- RLS: cualquiera puede leer (para el redirect público)
ALTER TABLE public.qr_redirects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qr_redirects_public_read" ON public.qr_redirects
  FOR SELECT USING (true);

-- Solo el service role puede insertar/actualizar (desde API routes)
CREATE POLICY "qr_redirects_service_write" ON public.qr_redirects
  FOR ALL USING (false) WITH CHECK (false);

-- Función para incrementar scan_count de forma atómica
CREATE OR REPLACE FUNCTION increment_qr_scan(p_code text)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.qr_redirects
  SET scan_count = scan_count + 1
  WHERE code = p_code;
$$;
