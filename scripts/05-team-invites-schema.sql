-- Team invites table for better invitation management
CREATE TABLE IF NOT EXISTS team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  token VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view pending invites by email"
  ON team_invites FOR SELECT
  USING (status = 'pending');

-- Subscription tiers table
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  monthly_price DECIMAL(10, 2),
  yearly_price DECIMAL(10, 2),
  tokens_per_month INT,
  requests_per_minute INT,
  team_members INT,
  api_keys_limit INT,
  features TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default tiers
INSERT INTO subscription_tiers (name, monthly_price, yearly_price, tokens_per_month, requests_per_minute, team_members, api_keys_limit, features) VALUES
('Free', 0, 0, 100000, 10, 1, 1, ARRAY['Basic analytics', 'Community support']),
('Pro', 29, 290, 10000000, 1000, 5, 10, ARRAY['Advanced analytics', 'Priority support', 'Webhooks', 'All models']),
('Enterprise', NULL, NULL, NULL, NULL, NULL, NULL, ARRAY['Unlimited everything', 'Dedicated support', 'Custom SLA', 'SSO/SAML'])
ON CONFLICT DO NOTHING;

-- Usage events for detailed tracking
CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usage_events_user_timestamp ON usage_events(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_usage_events_type ON usage_events(event_type);
