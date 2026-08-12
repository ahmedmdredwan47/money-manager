-- =================================================================
-- MIGRATION: Enforce BDT as the application's base/reporting currency
-- =================================================================
-- Corrects two stale DEFAULT values from the initial schema that were
-- set to 'USD'. BDT is the fixed base/reporting currency for this app.

-- 1. profiles.currency should default to BDT (not USD)
ALTER TABLE public.profiles
  ALTER COLUMN currency SET DEFAULT 'BDT';

-- Update any existing profile rows that still have the old 'USD' default
UPDATE public.profiles
  SET currency = 'BDT'
  WHERE currency = 'USD';

-- 2. accounts.currency should also default to BDT (not USD)
ALTER TABLE public.accounts
  ALTER COLUMN currency SET DEFAULT 'BDT';

-- transactions.currency: same fix (default was USD)
ALTER TABLE public.transactions
  ALTER COLUMN currency SET DEFAULT 'BDT';
