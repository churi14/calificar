-- Agregar asignación de cliente y notas a qr_redirects
ALTER TABLE public.qr_redirects
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS notes text;

CREATE INDEX IF NOT EXISTS qr_redirects_client_id_idx ON public.qr_redirects (client_id);
