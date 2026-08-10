-- Propietario del QR para auto-servicio (usuarios que crean sus propios QRs)
ALTER TABLE public.qr_redirects
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS label text; -- nombre/etiqueta del QR (visible solo para el dueño)

CREATE INDEX IF NOT EXISTS qr_redirects_owner_id_idx ON public.qr_redirects (owner_id);
