/*
# FinPilot: Fixed schema with proper Supabase Auth integration

## Changes from previous migration:
1. profiles.id now references auth.users.id (no more gen_random_uuid)
2. All foreign keys use profile_id -> profiles(id) which is auth.uid()
3. Removed broken user_id indexes
4. RLS policies now use auth.uid() for proper user isolation
5. Added trigger to auto-create profile on user signup
*/

-- Drop existing tables in correct order (due to foreign keys)
DROP TABLE IF EXISTS recommendations CASCADE;
DROP TABLE IF EXISTS portfolio_holdings CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS financial_profiles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'User',
  greeting_name text NOT NULL DEFAULT 'User',
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only access their own profile
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE TO authenticated USING (auth.uid() = id);

CREATE TABLE financial_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  risk_profile text NOT NULL DEFAULT 'Moderate',
  risk_score integer NOT NULL DEFAULT 50,
  investment_horizon text NOT NULL DEFAULT '3-7 years',
  primary_goal text NOT NULL DEFAULT 'Build Wealth',
  experience text NOT NULL DEFAULT 'Intermediate',
  liquidity_preference text NOT NULL DEFAULT 'Balanced',
  monthly_income_band text NOT NULL DEFAULT '₹50,000 - ₹1,00,000',
  monthly_income_estimated integer NOT NULL DEFAULT 85000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (profile_id)
);

ALTER TABLE financial_profiles ENABLE ROW LEVEL SECURITY;

-- Financial profiles: users can only access their own
DROP POLICY IF EXISTS "financial_profiles_select_own" ON financial_profiles;
CREATE POLICY "financial_profiles_select_own" ON financial_profiles
  FOR SELECT TO authenticated USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "financial_profiles_insert_own" ON financial_profiles;
CREATE POLICY "financial_profiles_insert_own" ON financial_profiles
  FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "financial_profiles_update_own" ON financial_profiles;
CREATE POLICY "financial_profiles_update_own" ON financial_profiles
  FOR UPDATE TO authenticated USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "financial_profiles_delete_own" ON financial_profiles;
CREATE POLICY "financial_profiles_delete_own" ON financial_profiles
  FOR DELETE TO authenticated USING (profile_id = auth.uid());

CREATE TABLE goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  target_amount integer NOT NULL,
  current_amount integer NOT NULL DEFAULT 0,
  target_year integer NOT NULL,
  monthly_contribution integer NOT NULL DEFAULT 0,
  icon text NOT NULL DEFAULT 'home',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Goals: users can only access their own
DROP POLICY IF EXISTS "goals_select_own" ON goals;
CREATE POLICY "goals_select_own" ON goals
  FOR SELECT TO authenticated USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "goals_insert_own" ON goals;
CREATE POLICY "goals_insert_own" ON goals
  FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "goals_update_own" ON goals;
CREATE POLICY "goals_update_own" ON goals
  FOR UPDATE TO authenticated USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "goals_delete_own" ON goals;
CREATE POLICY "goals_delete_own" ON goals
  FOR DELETE TO authenticated USING (profile_id = auth.uid());

CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month text NOT NULL,
  income integer NOT NULL DEFAULT 0,
  expenses integer NOT NULL DEFAULT 0,
  savings integer NOT NULL DEFAULT 0,
  investments integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Transactions: users can only access their own
DROP POLICY IF EXISTS "transactions_select_own" ON transactions;
CREATE POLICY "transactions_select_own" ON transactions
  FOR SELECT TO authenticated USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "transactions_insert_own" ON transactions;
CREATE POLICY "transactions_insert_own" ON transactions
  FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "transactions_update_own" ON transactions;
CREATE POLICY "transactions_update_own" ON transactions
  FOR UPDATE TO authenticated USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "transactions_delete_own" ON transactions;
CREATE POLICY "transactions_delete_own" ON transactions
  FOR DELETE TO authenticated USING (profile_id = auth.uid());

CREATE TABLE portfolio_holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  asset_class text NOT NULL,
  platform text NOT NULL,
  current_value integer NOT NULL,
  units numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;

-- Portfolio holdings: users can only access their own
DROP POLICY IF EXISTS "portfolio_holdings_select_own" ON portfolio_holdings;
CREATE POLICY "portfolio_holdings_select_own" ON portfolio_holdings
  FOR SELECT TO authenticated USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "portfolio_holdings_insert_own" ON portfolio_holdings;
CREATE POLICY "portfolio_holdings_insert_own" ON portfolio_holdings
  FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "portfolio_holdings_update_own" ON portfolio_holdings;
CREATE POLICY "portfolio_holdings_update_own" ON portfolio_holdings
  FOR UPDATE TO authenticated USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "portfolio_holdings_delete_own" ON portfolio_holdings;
CREATE POLICY "portfolio_holdings_delete_own" ON portfolio_holdings
  FOR DELETE TO authenticated USING (profile_id = auth.uid());

CREATE TABLE recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  priority integer NOT NULL DEFAULT 1,
  what_happened text NOT NULL,
  why_it_matters text NOT NULL,
  what_to_do text NOT NULL,
  cta_label text NOT NULL DEFAULT 'See how to fix this',
  metric_value text,
  metric_label text,
  severity text NOT NULL DEFAULT 'warning',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Recommendations: users can only access their own
DROP POLICY IF EXISTS "recommendations_select_own" ON recommendations;
CREATE POLICY "recommendations_select_own" ON recommendations
  FOR SELECT TO authenticated USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "recommendations_insert_own" ON recommendations;
CREATE POLICY "recommendations_insert_own" ON recommendations
  FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "recommendations_update_own" ON recommendations;
CREATE POLICY "recommendations_update_own" ON recommendations
  FOR UPDATE TO authenticated USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "recommendations_delete_own" ON recommendations;
CREATE POLICY "recommendations_delete_own" ON recommendations
  FOR DELETE TO authenticated USING (profile_id = auth.uid());

-- Correct indexes on profile_id (not user_id)
CREATE INDEX IF NOT EXISTS idx_goals_profile ON goals(profile_id);
CREATE INDEX IF NOT EXISTS idx_transactions_profile ON transactions(profile_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_profile ON portfolio_holdings(profile_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_profile ON recommendations(profile_id);
CREATE INDEX IF NOT EXISTS idx_financial_profiles_profile ON financial_profiles(profile_id);

-- Function to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, greeting_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.financial_profiles TO anon, authenticated;
GRANT ALL ON public.goals TO anon, authenticated;
GRANT ALL ON public.transactions TO anon, authenticated;
GRANT ALL ON public.portfolio_holdings TO anon, authenticated;
GRANT ALL ON public.recommendations TO anon, authenticated;

-- Seed demo data for a specific demo user (optional, for testing)
-- This can be run manually if needed with a known UUID