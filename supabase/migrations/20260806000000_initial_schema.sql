-- =================================================================
-- WEALTHWISE MONEY MANAGER - INITIAL SUPABASE POSTGRESQL MIGRATION
-- =================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================
-- 2. USERS (Profiles extension of auth.users)
-- =================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automatic Profile Creation Trigger on Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =================================================================
-- 3. ACCOUNTS
-- =================================================================
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bank', 'cash', 'card', 'bkash', 'nagad', 'rocket', 'checking', 'savings', 'credit_card', 'investment', 'loan', 'other')),
  balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  account_number_last4 VARCHAR(4),
  color VARCHAR(30),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =================================================================
-- 4. CATEGORIES
-- =================================================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL for default system categories
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  icon TEXT,
  color VARCHAR(30),
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_category UNIQUE (user_id, name, type)
);

-- =================================================================
-- 5. TRANSACTIONS
-- =================================================================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  transfer_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  payee_merchant TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'cleared' CHECK (status IN ('pending', 'cleared', 'reconciled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =================================================================
-- 6. BUDGETS
-- =================================================================
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  amount_limit NUMERIC(14, 2) NOT NULL CHECK (amount_limit > 0),
  period TEXT NOT NULL DEFAULT 'monthly' CHECK (period IN ('monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_category_budget UNIQUE (user_id, category_id, period, start_date)
);

-- =================================================================
-- 7. SAVINGS GOALS
-- =================================================================
CREATE TABLE public.savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  target_amount NUMERIC(14, 2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (current_amount >= 0),
  target_date DATE,
  color VARCHAR(30),
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =================================================================
-- 8. RECURRING TRANSACTIONS
-- =================================================================
CREATE TABLE public.recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  payee_merchant TEXT,
  description TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE,
  last_processed_date DATE,
  next_due_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =================================================================
-- 9. PERFORMANCE INDEXES
-- =================================================================
CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_transactions_user_id_date ON public.transactions(user_id, date DESC);
CREATE INDEX idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX idx_savings_goals_user_id ON public.savings_goals(user_id);
CREATE INDEX idx_recurring_tx_user_due ON public.recurring_transactions(user_id, next_due_date) WHERE is_active = TRUE;

-- =================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- =================================================================

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Accounts RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own accounts" ON public.accounts FOR ALL USING (auth.uid() = user_id);

-- Categories RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view system and personal categories" ON public.categories FOR SELECT USING (is_system = TRUE OR auth.uid() = user_id);
CREATE POLICY "Users can manage their custom categories" ON public.categories FOR ALL USING (auth.uid() = user_id AND is_system = FALSE);

-- Transactions RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);

-- Budgets RLS
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own budgets" ON public.budgets FOR ALL USING (auth.uid() = user_id);

-- Savings Goals RLS
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own savings goals" ON public.savings_goals FOR ALL USING (auth.uid() = user_id);

-- Recurring Transactions RLS
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own recurring transactions" ON public.recurring_transactions FOR ALL USING (auth.uid() = user_id);
