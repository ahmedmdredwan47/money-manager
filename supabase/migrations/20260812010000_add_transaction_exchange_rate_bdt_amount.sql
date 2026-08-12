-- =================================================================
-- MIGRATION: Add historical exchange rate and BDT amount to transactions
-- =================================================================

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(14, 6) DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS bdt_amount NUMERIC(14, 2);

COMMENT ON COLUMN public.transactions.exchange_rate IS 'Exchange rate (foreign per BDT) at the time the transaction was recorded';
COMMENT ON COLUMN public.transactions.bdt_amount IS 'Historical BDT equivalent value locked at the time of transaction';
