-- Agregar campo menu_url a qr_redirects
ALTER TABLE qr_redirects
  ADD COLUMN IF NOT EXISTS menu_url text;

-- Tabla para calificaciones del mozo
CREATE TABLE IF NOT EXISTS mozo_ratings (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  code        text        NOT NULL,
  stars       integer     NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment     text,
  created_at  timestamptz DEFAULT now()
);

-- RLS: solo lectura para admin vía service role (no se expone al público)
ALTER TABLE mozo_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON mozo_ratings
  USING (true)
  WITH CHECK (true);
