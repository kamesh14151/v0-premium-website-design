# 🔧 FIX SUPABASE DATABASE ERRORS

## ❌ Current Errors
Your dashboard is showing these 500/400 errors because the database tables don't exist or have wrong columns:
- `request_history` table missing or wrong schema
- `api_keys` table column mismatch  
- Missing indexes and RLS policies

---

## ✅ SOLUTION - Follow These Steps

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `hqfgblqxcqowiudrfioi`
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run the Setup SQL
1. Click **New Query**
2. Open the file `SUPABASE_SETUP.sql` in this project
3. Copy ALL the SQL content
4. Paste it into the Supabase SQL Editor
5. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify Tables Created
Run this query to verify:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'api_keys', 'request_history', 'usage_metrics')
ORDER BY table_name;
```

You should see all 4 tables listed.

### Step 4: Test Your Dashboard
1. Refresh your dashboard page
2. All errors should be gone
3. You should see:
   - API calls count: 0 (will increase as you use it)
   - Active keys: 0 (until you create keys)
   - Charts showing "No data"

---

## 📊 What the SQL Setup Creates

### Tables Created:
1. **profiles** - User profile information
2. **api_keys** - Your API keys with SHA-256 hashed storage
3. **request_history** - All API request logs (for dashboard charts)
4. **usage_metrics** - Daily aggregated usage statistics

### Security Features:
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only see their own data
- ✅ Automatic profile creation on signup
- ✅ Cascade deletes when user is deleted

### Indexes Created:
- Fast queries by user_id
- Fast queries by date/timestamp
- Fast lookups by API key hash

---

## 🧪 Optional: Add Test Data

After setup, you can add sample data for testing:

1. Get your user ID:
```sql
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
```

2. Insert sample request history:
```sql
INSERT INTO public.request_history (user_id, model, prompt_tokens, completion_tokens, total_tokens, response_time, cost)
VALUES 
  ('YOUR-USER-ID-HERE', 'kimi', 150, 300, 450, 1200, 0.0),
  ('YOUR-USER-ID-HERE', 'qwen3', 200, 400, 600, 800, 0.0),
  ('YOUR-USER-ID-HERE', 'llama-4', 100, 200, 300, 950, 0.0),
  ('YOUR-USER-ID-HERE', 'gpt-oss', 180, 350, 530, 1100, 0.0),
  ('YOUR-USER-ID-HERE', 'mistral-small-24b', 120, 250, 370, 900, 0.0);
```

This will populate your dashboard with sample usage data.

---

## 🔍 Troubleshooting

### Error: "permission denied for table"
- Make sure you're logged into Supabase dashboard
- Make sure you have admin access to your project

### Error: "relation already exists"
- Tables already exist, skip to Step 3 to verify
- Or run the cleanup section in SUPABASE_SETUP.sql first

### Dashboard still shows errors after setup
1. Check browser console for specific error messages
2. Make sure you're logged in to the dashboard
3. Try hard refresh (Ctrl+F5)
4. Check if RLS policies are enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'api_keys', 'request_history', 'usage_metrics');
```

### API Key creation error
Make sure `api_keys` table has these columns:
- id (uuid)
- user_id (uuid)
- name (text)
- key_prefix (text) - Must have this!
- key_hash (text)
- is_active (boolean) - Must have this!
- created_at (timestamptz)

---

## 📝 Next Steps After Database Setup

1. ✅ Run the SQL setup
2. ✅ Verify tables exist
3. ✅ Refresh dashboard - errors should be gone
4. ✅ Create your first API key
5. ✅ Test API calls - they will appear in request_history
6. ✅ Watch your dashboard charts populate with real data

---

## 💡 How It Works

### When you create an API key:
1. Frontend generates `nxq_` + 64-char random hex
2. SHA-256 hash is stored in database (never plain key)
3. You see the key once, copy it immediately
4. Backend validates requests by comparing hashes

### When you make API calls:
1. Request goes to aj-fresh backend
2. Backend logs to `request_history` table
3. Dashboard queries this table for:
   - Total calls count
   - 7-day chart data
   - Model distribution pie chart
   - Average latency
   - Monthly costs

### Dashboard Stats Update:
- Real-time: Every page load
- Uses Supabase queries with filters:
  - `eq('user_id', your_id)` - Only your data
  - `eq('is_active', true)` - Only active keys
  - `gte('created_at', date)` - Date range filters

---

## 🎯 Expected Results

After running the SQL setup, your dashboard will show:
- ✅ No more 400/500 errors in console
- ✅ Stats showing 0 (until you use the API)
- ✅ Charts showing "No data" (until you make requests)
- ✅ Ability to create API keys successfully
- ✅ Ability to view/delete keys

As you use the API:
- 📈 Charts will populate with real data
- 📊 Model distribution will show actual usage
- ⚡ Response times will show average latency
- 💰 Costs will accumulate (currently $0 for free models)

---

Need help? Check the Supabase logs in Dashboard > Logs > Postgres Logs
