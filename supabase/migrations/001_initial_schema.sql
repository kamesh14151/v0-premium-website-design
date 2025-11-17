-- ========================================
-- AJStudioz AI Developer Portal - Database Schema
-- Run this in Supabase SQL Editor
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. PROFILES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  api_quota INTEGER DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 2. API KEYS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  name TEXT NOT NULL,
  permissions JSONB DEFAULT '{"chat": true, "models": true}'::jsonb,
  rate_limit INTEGER DEFAULT 100,
  last_used TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);

-- ========================================
-- 3. REQUEST HISTORY TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS request_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  model TEXT NOT NULL,
  provider TEXT NOT NULL,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  cost NUMERIC(10, 6) DEFAULT 0,
  response_time INTEGER,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'error', 'rate_limited')),
  error_message TEXT,
  has_reasoning BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_request_history_user_id ON request_history(user_id);
CREATE INDEX IF NOT EXISTS idx_request_history_created_at ON request_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_request_history_model ON request_history(model);

-- ========================================
-- 4. USAGE METRICS TABLE (Monthly aggregates)
-- ========================================
CREATE TABLE IF NOT EXISTS usage_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  month DATE NOT NULL,
  total_requests INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost NUMERIC(10, 2) DEFAULT 0,
  models_used JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, month)
);

CREATE INDEX IF NOT EXISTS idx_usage_metrics_user_month ON usage_metrics(user_id, month);

-- ========================================
-- 5. TEAMS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 6. TEAM MEMBERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- ========================================
-- 7. WEBHOOKS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 8. WEBHOOK DELIVERIES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  delivered_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RLS POLICIES
-- ========================================

-- Profiles: Users can view and update their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- API Keys: Users can manage their own API keys
DROP POLICY IF EXISTS "Users can view own API keys" ON api_keys;
CREATE POLICY "Users can view own API keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own API keys" ON api_keys;
CREATE POLICY "Users can create own API keys" ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own API keys" ON api_keys;
CREATE POLICY "Users can update own API keys" ON api_keys
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own API keys" ON api_keys;
CREATE POLICY "Users can delete own API keys" ON api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Request History: Users can view their own requests
DROP POLICY IF EXISTS "Users can view own request history" ON request_history;
CREATE POLICY "Users can view own request history" ON request_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert request history" ON request_history;
CREATE POLICY "Service role can insert request history" ON request_history
  FOR INSERT WITH CHECK (true);

-- Usage Metrics: Users can view their own usage
DROP POLICY IF EXISTS "Users can view own usage metrics" ON usage_metrics;
CREATE POLICY "Users can view own usage metrics" ON usage_metrics
  FOR SELECT USING (auth.uid() = user_id);

-- Teams: Users can view teams they own or are members of
DROP POLICY IF EXISTS "Users can view their teams" ON teams;
CREATE POLICY "Users can view their teams" ON teams
  FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (SELECT 1 FROM team_members WHERE team_id = teams.id AND user_id = auth.uid())
  );

-- Team Members: Can view if part of team
DROP POLICY IF EXISTS "Users can view team members" ON team_members;
CREATE POLICY "Users can view team members" ON team_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM teams WHERE id = team_id AND owner_id = auth.uid()) OR
    user_id = auth.uid()
  );

-- Webhooks: Users can manage their own webhooks
DROP POLICY IF EXISTS "Users can manage own webhooks" ON webhooks;
CREATE POLICY "Users can manage own webhooks" ON webhooks
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view webhook deliveries" ON webhook_deliveries;
CREATE POLICY "Users can view webhook deliveries" ON webhook_deliveries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM webhooks WHERE id = webhook_id AND user_id = auth.uid())
  );

-- ========================================
-- FUNCTIONS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- SEED DATA (Demo Users & API Keys)
-- ========================================

-- Insert demo API key hashes (for testing)
-- These correspond to: ak-demo123456789, ak-test123456789, aj-demo123456789abcdef, aj-test987654321fedcba
INSERT INTO api_keys (id, user_id, key_hash, key_prefix, name, permissions, rate_limit, is_active)
SELECT 
  uuid_generate_v4(),
  id,
  encode(digest('ak-demo123456789', 'sha256'), 'hex'),
  'ak-demo',
  'Demo API Key',
  '{"chat": true, "models": true}'::jsonb,
  1000,
  true
FROM profiles
LIMIT 1
ON CONFLICT DO NOTHING;

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_request_history_status ON request_history(status);
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_user_active ON webhooks(user_id, is_active);

-- ========================================
-- GRANT PERMISSIONS
-- ========================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ========================================
-- DONE! Database setup complete
-- ========================================
