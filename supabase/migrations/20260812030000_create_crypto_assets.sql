-- =================================================================
-- MIGRATION: Cryptocurrency master data
-- =================================================================
-- This catalog deliberately stores metadata only. Crypto quantities and
-- valuations will be introduced in later phases using high-precision NUMERIC
-- columns; no existing fiat account or transaction behaviour changes here.

CREATE TABLE public.crypto_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL,
  name TEXT NOT NULL,
  decimal_precision SMALLINT NOT NULL CHECK (decimal_precision BETWEEN 0 AND 30),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT crypto_assets_code_unique UNIQUE (code),
  CONSTRAINT crypto_assets_code_normalized CHECK (code = UPPER(TRIM(code)))
);

CREATE INDEX idx_crypto_assets_active ON public.crypto_assets(is_active) WHERE is_active = TRUE;

ALTER TABLE public.crypto_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view crypto assets"
  ON public.crypto_assets
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Idempotent master data seed. `decimal_precision` is presentation/validation
-- metadata; future quantity columns will use a high-precision NUMERIC scale.
INSERT INTO public.crypto_assets (code, name, decimal_precision, is_active)
VALUES
  ('BTC', 'Bitcoin', 18, TRUE),
  ('ETH', 'Ethereum', 18, TRUE),
  ('USDT', 'Tether', 6, TRUE)
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  decimal_precision = EXCLUDED.decimal_precision,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
