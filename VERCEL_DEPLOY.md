# 🚀 Vercel Deployment Guide - AJStudioz AI Developer Portal

## 📋 Pre-Deployment Checklist

✅ **Repository**: Pushed to https://github.com/kamesh14151/v0-premium-website-design  
✅ **Database Schema**: Ready in `supabase/migrations/001_initial_schema.sql`  
✅ **API Endpoints**: Chat completions & models listing configured  
✅ **Environment Template**: `.env.example` with all required variables  
✅ **Configuration**: `vercel.json` with CORS and build settings  

---

## 🎯 Step 1: Run Database Migration

Before deploying, set up your Supabase database:

1. Go to https://supabase.com/dashboard
2. Open your project: **hqfgblqxcqowiudrfioi**
3. Navigate to **SQL Editor**
4. Copy the entire content from `supabase/migrations/001_initial_schema.sql`
5. Paste and click **Run**

This creates:
- 8 tables (profiles, api_keys, request_history, usage_metrics, teams, webhooks, etc.)
- Row Level Security policies
- Automatic triggers
- Performance indexes

---

## 🚀 Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

```powershell
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project directory)
cd "c:\New folder\v0-developer-portal-design"
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set project name: ajstudioz-ai-portal
# - Framework preset: Next.js
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Import Git Repository: `kamesh14151/v0-premium-website-design`
3. Configure Project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

---

## 🔐 Step 3: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

### Database (Supabase)
```env
NEXT_PUBLIC_SUPABASE_URL=https://hqfgblqxcqowiudrfioi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZmdibHF4Y3Fvd2l1ZHJmaW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4MjI1MDAsImV4cCI6MjA0NzM5ODUwMH0.w4Pg9HWW42VLn7eR_FnJG3o7lKZmjqLrywxHPjvQAjY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZmdibHF4Y3Fvd2l1ZHJmaW9pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTgyMjUwMCwiZXhwIjoyMDQ3Mzk4NTAwfQ.MWHIDywrCmCLSKZ0_wW4Dn75qYOh0KghDbB0R23y4WE
DATABASE_URL=postgresql://neondb_owner:npg_xgxRnsgEPt0a@ep-little-block-a5xgvsic-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### AJStudioz API
```env
NEXT_PUBLIC_API_URL=https://api.ajstudioz.dev
AJSTUDIOZ_API_KEY=aj-demo123456789abcdef
```

### Groq Cloud (5 Keys for Rotation)
```env
GROQ_API_KEY1=your_groq_key_1
GROQ_API_KEY2=your_groq_key_2
GROQ_API_KEY3=your_groq_key_3
GROQ_API_KEY4=your_groq_key_4
GROQ_API_KEY5=your_groq_key_5
```

### Chutes AI
```env
CHUTES_API_TOKEN=your_chutes_token
```

### Cerebras AI
```env
CEREBRAS_API_KEY=your_cerebras_key
```

### OpenRouter (5 Keys for Rotation)
```env
OPENROUTER_API_KEY1=your_openrouter_key_1
OPENROUTER_API_KEY2=your_openrouter_key_2
OPENROUTER_API_KEY3=your_openrouter_key_3
OPENROUTER_API_KEY4=your_openrouter_key_4
OPENROUTER_API_KEY5=your_openrouter_key_5
```

### Optional (Local Ollama)
```env
OLLAMA_URL=http://localhost:11434
```

### System
```env
NODE_ENV=production
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important**: Set all variables for **Production**, **Preview**, and **Development** environments.

---

## 🧪 Step 4: Test Deployment

After deployment completes:

### 1. Check Build Logs
- Vercel Dashboard → Deployments → Latest → View Function Logs
- Ensure no errors in build process

### 2. Test Homepage
```
https://your-deployment-url.vercel.app
```
Should show landing page with model cards.

### 3. Test Models API
```bash
curl https://your-deployment-url.vercel.app/api/models
```
Should return all 13 models.

### 4. Test Chat API
```bash
curl -X POST https://your-deployment-url.vercel.app/api/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "model": "kimi",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### 5. Test Dashboard
```
https://your-deployment-url.vercel.app/dashboard
```
- Login with Supabase Auth
- Check models page shows all 13 models
- Test chat console

---

## 🎉 Step 5: Get API Keys for Providers

### Groq Cloud (Free - 5 keys recommended)
1. Go to https://console.groq.com
2. Sign in/up
3. Navigate to API Keys
4. Create 5 new API keys
5. Add to Vercel env vars as GROQ_API_KEY1-5

### Chutes AI
1. Visit https://api.chutes.ai or their platform
2. Sign up and get API token
3. Add as CHUTES_API_TOKEN

### Cerebras AI
1. Visit https://cerebras.ai
2. Sign up for API access
3. Get API key
4. Add as CEREBRAS_API_KEY

### OpenRouter (Free tier - 5 keys recommended)
1. Go to https://openrouter.ai
2. Sign up (free tier available)
3. Generate 5 API keys
4. Add to Vercel as OPENROUTER_API_KEY1-5

---

## 🔒 Security Best Practices

✅ **Never commit** `.env.local` to Git  
✅ **Use environment variables** in Vercel Dashboard  
✅ **Enable RLS policies** in Supabase (already configured)  
✅ **Rotate API keys** regularly  
✅ **Monitor usage** via request_history table  
✅ **Set up rate limiting** for production  

---

## 📊 Monitoring

### Check Logs
```powershell
# Using Vercel CLI
vercel logs your-deployment-url.vercel.app
```

### Database Monitoring
```sql
-- Check recent requests
SELECT * FROM request_history ORDER BY created_at DESC LIMIT 100;

-- Check token usage
SELECT model, SUM(total_tokens) as total_tokens 
FROM request_history 
GROUP BY model;

-- Check error rate
SELECT model, COUNT(*) as errors 
FROM request_history 
WHERE error IS NOT NULL 
GROUP BY model;
```

### Analytics Dashboard
- Vercel Analytics: https://vercel.com/analytics
- Supabase Dashboard: https://supabase.com/dashboard

---

## 🐛 Troubleshooting

### Build Fails
```powershell
# Test build locally first
npm install --legacy-peer-deps
npm run build
```

### API Errors
- Check environment variables in Vercel Dashboard
- Verify Supabase connection with service role key
- Check API provider keys are valid

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check Supabase project is not paused
- Test connection in Supabase SQL Editor

### CORS Errors
- `vercel.json` already configured with CORS headers
- If issues persist, check Vercel deployment logs

---

## 🚀 Custom Domain (Optional)

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain: `ai.ajstudioz.com`
3. Configure DNS records as shown
4. SSL automatically provisioned

---

## 📈 Performance Optimization

Already configured:
- ✅ Next.js 16 with App Router
- ✅ Automatic code splitting
- ✅ Image optimization
- ✅ API route caching
- ✅ Database connection pooling (Neon)
- ✅ Multi-key rotation for rate limits

---

## 🎯 Post-Deployment

1. ✅ Test all 13 models via chat console
2. ✅ Verify database logging works
3. ✅ Check rate limiting functions correctly
4. ✅ Monitor first 24 hours of usage
5. ✅ Set up alerts for errors
6. ✅ Share deployment URL with team

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Repo**: https://github.com/kamesh14151/v0-premium-website-design

---

**Your developer portal is ready! 🎉**

Access your deployment at: `https://your-project.vercel.app`

All 13 AI models from 4 providers are configured and ready to use!
