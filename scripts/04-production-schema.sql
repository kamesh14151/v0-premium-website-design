-- Production-ready schema for LLM platform

-- Create request history with streaming support
CREATE TABLE IF NOT EXISTS request_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  model TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT,
  tokens_input INT DEFAULT 0,
  tokens_output INT DEFAULT 0,
  tokens_total INT DEFAULT 0,
  cost DECIMAL(10, 8),
  status_code INT,
  response_time_ms INT,
  error_message TEXT,
  is_streaming BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create usage metrics for billing
CREATE TABLE IF NOT EXISTS usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  month TEXT NOT NULL, -- YYYY-MM format
  total_requests INT DEFAULT 0,
  total_tokens INT DEFAULT 0,
  total_cost DECIMAL(10, 8) DEFAULT 0,
  api_calls INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, month),
  UNIQUE(team_id, month)
);

-- Create model pricing configuration
CREATE TABLE IF NOT EXISTS model_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT UNIQUE NOT NULL,
  input_cost_per_1k_tokens DECIMAL(10, 10) NOT NULL,
  output_cost_per_1k_tokens DECIMAL(10, 10) NOT NULL,
  max_tokens INT DEFAULT 4096,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  plan_name TEXT NOT NULL, -- 'free', 'pro', 'enterprise'
  monthly_token_limit INT,
  rate_limit_per_minute INT,
  concurrent_requests INT,
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create rate limit tracking
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE NOT NULL,
  minute_start TIMESTAMP WITH TIME ZONE,
  request_count INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create API response cache for cost optimization
CREATE TABLE IF NOT EXISTS response_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  model TEXT NOT NULL,
  response TEXT NOT NULL,
  tokens INT,
  ttl_minutes INT DEFAULT 60,
  hit_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE request_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their request history"
  ON request_history FOR SELECT
  USING (
    auth.uid() = user_id OR 
    team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid() OR id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
  );

CREATE POLICY "Users can view their usage metrics"
  ON usage_metrics FOR SELECT
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid() OR id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
  );

CREATE POLICY "Anyone can view model pricing"
  ON model_pricing FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Users can view their subscription"
  ON subscription_plans FOR SELECT
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
  );

-- Insert default model pricing
INSERT INTO model_pricing (model_name, input_cost_per_1k_tokens, output_cost_per_1k_tokens) VALUES
('nexariq-pro', 0.000010, 0.000030),
('nexariq-fast', 0.000005, 0.000015),
('nexariq-vision', 0.000015, 0.000045)
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_request_history_user_id ON request_history(user_id);
CREATE INDEX IF NOT EXISTS idx_request_history_created_at ON request_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_request_history_model ON request_history(model);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_user_month ON usage_metrics(user_id, month);
CREATE INDEX IF NOT EXISTS idx_rate_limits_api_key ON rate_limits(api_key_id);
