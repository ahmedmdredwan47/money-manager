-- =================================================================
-- MIGRATION: Safe normalization of currency codes across database
-- =================================================================

-- 1. Normalize accounts table currency codes (trim, uppercase, fallback to BDT)
UPDATE public.accounts
SET currency = UPPER(TRIM(currency))
WHERE currency IS NOT NULL AND currency != UPPER(TRIM(currency));

UPDATE public.accounts
SET currency = 'BDT'
WHERE currency IS NULL OR TRIM(currency) = '';

ALTER TABLE public.accounts
  ALTER COLUMN currency SET DEFAULT 'BDT';

-- 2. Normalize transactions table currency codes
UPDATE public.transactions
SET currency = UPPER(TRIM(currency))
WHERE currency IS NOT NULL AND currency != UPPER(TRIM(currency));

UPDATE public.transactions
SET currency = 'BDT'
WHERE currency IS NULL OR TRIM(currency) = '';

ALTER TABLE public.transactions
  ALTER COLUMN currency SET DEFAULT 'BDT';

-- 3. Ensure profile currency default is locked to BDT
UPDATE public.profiles
SET currency = 'BDT'
WHERE currency IS NULL OR TRIM(currency) = '' OR currency != 'BDT';

ALTER TABLE public.profiles
  ALTER COLUMN currency SET DEFAULT 'BDT';
