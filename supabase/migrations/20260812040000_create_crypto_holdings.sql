-- =================================================================
-- MIGRATION: Cryptocurrency holdings
-- =================================================================
-- Quantities are kept independently from any reporting-currency valuation.
-- NUMERIC(36, 18) supports exact decimal storage up to 18 fractional places.

CREATE TABLE public.crypto_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  crypto_asset_id UUID NOT NULL REFERENCES public.crypto_assets(id) ON DELETE RESTRICT,
  quantity NUMERIC(36, 18) NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT crypto_holdings_account_asset_unique UNIQUE (account_id, crypto_asset_id)
);

CREATE INDEX idx_crypto_holdings_user_id ON public.crypto_holdings(user_id);
CREATE INDEX idx_crypto_holdings_account_id ON public.crypto_holdings(account_id);
CREATE INDEX idx_crypto_holdings_crypto_asset_id ON public.crypto_holdings(crypto_asset_id);

-- Keep account ownership and asset-state/precision rules in the database so
-- they are enforced for every caller, not only the application UI.
CREATE OR REPLACE FUNCTION public.validate_crypto_holding()
RETURNS TRIGGER AS $$
DECLARE
  asset_precision SMALLINT;
  asset_is_active BOOLEAN;
  account_owner UUID;
BEGIN
  SELECT decimal_precision, is_active
    INTO asset_precision, asset_is_active
    FROM public.crypto_assets
    WHERE id = NEW.crypto_asset_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cryptocurrency does not exist';
  END IF;

  IF NOT asset_is_active THEN
    RAISE EXCEPTION 'Cryptocurrency is inactive';
  END IF;

  SELECT user_id INTO account_owner
    FROM public.accounts
    WHERE id = NEW.account_id;

  IF NOT FOUND OR account_owner <> NEW.user_id THEN
    RAISE EXCEPTION 'Holding account must belong to the holding user';
  END IF;

  IF NEW.quantity <> TRUNC(NEW.quantity, asset_precision) THEN
    RAISE EXCEPTION 'Quantity exceeds the allowed decimal precision (%)', asset_precision;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER validate_crypto_holding_before_write
  BEFORE INSERT OR UPDATE OF user_id, account_id, crypto_asset_id, quantity
  ON public.crypto_holdings
  FOR EACH ROW EXECUTE FUNCTION public.validate_crypto_holding();

-- Expose the NUMERIC quantity as text for API consumers. This prevents a
-- JavaScript client from receiving it as a binary floating-point number.
CREATE VIEW public.crypto_holdings_with_quantity_text
WITH (security_invoker = true) AS
SELECT
  h.id,
  h.user_id,
  h.account_id,
  h.crypto_asset_id,
  h.quantity::TEXT AS quantity,
  h.created_at,
  h.updated_at
FROM public.crypto_holdings AS h;

ALTER TABLE public.crypto_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own crypto holdings"
  ON public.crypto_holdings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own crypto holdings"
  ON public.crypto_holdings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crypto holdings"
  ON public.crypto_holdings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own crypto holdings"
  ON public.crypto_holdings FOR DELETE
  USING (auth.uid() = user_id);
