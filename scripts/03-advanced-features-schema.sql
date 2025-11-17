-- Added tables for team collaboration, request history, notifications, and access controls

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, user_id)
);

CREATE TABLE IF NOT EXISTS api_key_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES api_keys ON DELETE CASCADE NOT NULL,
  permission TEXT NOT NULL, -- 'read', 'write', 'delete'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(api_key_id, permission)
);

CREATE TABLE IF NOT EXISTS request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  api_key_id UUID REFERENCES api_keys ON DELETE SET NULL,
  model TEXT NOT NULL,
  tokens_used INT,
  cost DECIMAL(10, 6),
  status_code INT,
  response_time_ms INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'quota_warning', 'key_expired', 'team_invite'
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_key_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their teams" ON teams FOR SELECT USING (
  owner_id = auth.uid() OR id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

CREATE POLICY "Users can manage their teams" ON teams FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can view team members" ON team_members FOR SELECT USING (
  team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid() OR id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
);

CREATE POLICY "Users can view their request logs" ON request_logs FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
