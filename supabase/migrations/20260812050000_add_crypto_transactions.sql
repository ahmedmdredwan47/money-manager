-- Crypto transactions retain their exact native quantity alongside the BDT
-- valuation captured when the transaction was created.
ALTER TABLE public.transactions
  ADD COLUMN crypto_asset_id UUID REFERENCES public.crypto_assets(id) ON DELETE RESTRICT,
  ADD COLUMN crypto_quantity NUMERIC(36, 18),
  ALTER COLUMN bdt_amount TYPE NUMERIC(36, 18);

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_crypto_fields_check CHECK (
    (crypto_asset_id IS NULL AND crypto_quantity IS NULL)
    OR (crypto_asset_id IS NOT NULL AND crypto_quantity IS NOT NULL AND crypto_quantity > 0)
  );

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_crypto_direction_check CHECK (
    crypto_quantity IS NULL OR type IN ('income', 'expense')
  );

CREATE INDEX idx_transactions_crypto_asset_id ON public.transactions(crypto_asset_id)
  WHERE crypto_asset_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.apply_crypto_transaction()
RETURNS TRIGGER AS $$
DECLARE
  current_quantity NUMERIC(36, 18);
  holding_id UUID;
  delta NUMERIC(36, 18);
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.crypto_quantity IS NOT NULL AND
    (NEW.crypto_quantity IS DISTINCT FROM OLD.crypto_quantity OR NEW.crypto_asset_id IS DISTINCT FROM OLD.crypto_asset_id
      OR NEW.account_id IS DISTINCT FROM OLD.account_id OR NEW.type IS DISTINCT FROM OLD.type) THEN
    RAISE EXCEPTION 'Crypto transaction quantity, asset, account, and direction cannot be edited';
  END IF;

  IF TG_OP = 'UPDATE' OR (TG_OP = 'INSERT' AND NEW.crypto_quantity IS NULL) THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  IF TG_OP = 'DELETE' AND OLD.crypto_quantity IS NULL THEN RETURN OLD; END IF;

  SELECT id, quantity INTO holding_id, current_quantity
  FROM public.crypto_holdings
  WHERE account_id = COALESCE(NEW.account_id, OLD.account_id)
    AND crypto_asset_id = COALESCE(NEW.crypto_asset_id, OLD.crypto_asset_id)
    AND user_id = COALESCE(NEW.user_id, OLD.user_id)
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'A matching cryptocurrency holding is required'; END IF;
  delta := COALESCE(NEW.crypto_quantity, OLD.crypto_quantity);

  -- Insert income adds / expense removes. Deleting reverses that operation.
  IF (TG_OP = 'INSERT' AND NEW.type = 'income') OR (TG_OP = 'DELETE' AND OLD.type = 'expense') THEN
    UPDATE public.crypto_holdings SET quantity = quantity + delta, updated_at = NOW() WHERE id = holding_id;
  ELSE
    IF current_quantity < delta THEN RAISE EXCEPTION 'Cannot remove more cryptocurrency than currently held'; END IF;
    UPDATE public.crypto_holdings SET quantity = quantity - delta, updated_at = NOW() WHERE id = holding_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER apply_crypto_transaction_before_write
  BEFORE INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.apply_crypto_transaction();
