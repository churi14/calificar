-- Migración: tabla stamp_tokens para tokens de sello de un solo uso
-- Ejecutar en Supabase → SQL Editor

-- 1. Crear tabla
CREATE TABLE IF NOT EXISTS stamp_tokens (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id  UUID        NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  token       TEXT        NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '2 hours'),
  used_at     TIMESTAMPTZ DEFAULT NULL
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_stamp_tokens_program_active
  ON stamp_tokens(program_id, created_at DESC)
  WHERE used_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_stamp_tokens_token
  ON stamp_tokens(token)
  WHERE used_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_stamp_tokens_expires
  ON stamp_tokens(expires_at);

-- 3. Asegurar que stamp_secret exista en loyalty_programs (habilita tokens para el programa)
ALTER TABLE loyalty_programs
  ADD COLUMN IF NOT EXISTS stamp_secret TEXT;
