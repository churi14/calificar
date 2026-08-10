-- Comprador del cartel QR (sin requerir cuenta registrada)
ALTER TABLE public.qr_redirects
  ADD COLUMN IF NOT EXISTS buyer_name  text,
  ADD COLUMN IF NOT EXISTS buyer_phone text;
