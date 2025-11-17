# 🚀 Production Deployment Guide - AJStudioz AI Developer Portal

## Overview
Multi-cloud AI developer platform with 13 models from 4 providers, featuring rate limit protection and chain-of-thought reasoning.

## 📋 Prerequisites

### Required Accounts
1. **Vercel** - For hosting (recommended)
2. **Supabase** - For database and auth
3. **API Keys**:
   - Groq (5 keys recommended)
   - Chutes AI (1 key)
   - Cerebras AI (1 key)
   - OpenRouter (5 keys recommended)

### Optional
- **Ollama** - For local privacy-focused models

---

## 🔧 Setup Steps

### 1. Clone and Install
```bash
git clone https://github.com/YOUR_USERNAME/v0-developer-portal-design.git
cd v0-developer-portal-design
npm install
```

### 2. Database Setup (Supabase)

#### Create Tables
Run these SQL commands in Supabase SQL Editor:

```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  permissions JSONB DEFAULT '{}',
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Request History table
CREATE TABLE request_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES api_keys(id),
  model TEXT NOT NULL,
  tokens_used INTEGER,
  cost NUMERIC(10, 6),
  response_time INTEGER,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage Metrics table
CREATE TABLE usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  total_tokens INTEGER DEFAULT 0,
  total_cost NUMERIC(10, 2) DEFAULT 0,
  total_requests INTEGER DEFAULT 0,
  UNIQUE(user_id, month)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view own API keys" ON api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own request history" ON request_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own usage metrics" ON usage_metrics FOR SELECT USING (auth.uid() = user_id);
```

### 3. Environment Variables

#### Copy example file
```bash
cp .env.example .env.local
```

#### Fill in your credentials:

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
DATABASE_URL=postgresql://...

# Groq (Get 5 keys from https://console.groq.com)
GROQ_API_KEY1=gsk_xxxxx1
GROQ_API_KEY2=gsk_xxxxx2
GROQ_API_KEY3=gsk_xxxxx3
GROQ_API_KEY4=gsk_xxxxx4
GROQ_API_KEY5=gsk_xxxxx5

# Chutes AI (Get from https://chutes.ai)
CHUTES_API_TOKEN=your_token

# Cerebras (Get from https://cerebras.ai)
CEREBRAS_API_KEY=your_key

# OpenRouter (Get 5 keys from https://openrouter.ai)
OPENROUTER_API_KEY1=sk-or-v1-xxxxx1
OPENROUTER_API_KEY2=sk-or-v1-xxxxx2
OPENROUTER_API_KEY3=sk-or-v1-xxxxx3
OPENROUTER_API_KEY4=sk-or-v1-xxxxx4
OPENROUTER_API_KEY5=sk-or-v1-xxxxx5

# Optional: Local Ollama
OLLAMA_URL=http://localhost:11434
```

### 4. Test Locally
```bash
npm run dev
```
Visit http://localhost:3000

### 5. Deploy to Vercel

#### Option A: Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

#### Option B: GitHub Integration
1. Push to GitHub
2. Connect repository in Vercel dashboard
3. Add environment variables
4. Deploy

---

## 🔑 API Key Setup Guide

### Groq (Free - 5 Keys Recommended)
1. Visit https://console.groq.com
2. Sign up for free
3. Create 5 API keys (or use same key 5 times)
4. Add to `GROQ_API_KEY1-5`

**Models**: Kimi, Qwen3, Llama-4, GPT-OSS

### Chutes AI (Free)
1. Visit https://chutes.ai
2. Sign up
3. Generate API token
4. Add to `CHUTES_API_TOKEN`

**Models**: GLM-4.5 Air

### Cerebras (Free)
1. Visit https://cerebras.ai
2. Register for API access
3. Get API key
4. Add to `CEREBRAS_API_KEY`

**Models**: ZAI GLM-4.6

### OpenRouter (Free - 5 Keys Recommended)
1. Visit https://openrouter.ai
2. Sign up
3. Create 5 API keys
4. Add to `OPENROUTER_API_KEY1-5`

**Models**: DeepSeek R1, Qwen3 Coder, Mistral Small (2 variants)

### Local Ollama (Optional - Privacy Mode)
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull models
ollama pull qwen3:1.7b
ollama pull glm-4.6:cloud

# Verify running
curl http://localhost:11434/api/tags
```

---

## 🎯 Model Configuration

### Available Models (13 Total)

#### ☁️ Cloud Models (11)
1. **Kimi K2 Instruct** - Large context chat (262K)
2. **Qwen 3 32B** - Advanced reasoning (40K tokens)
3. **Llama 4 Maverick** - Meta's latest
4. **GPT OSS 20B** - High output capacity
5. **GPT OSS 120B** - Large-scale model
6. **GLM-4.5 Air** - Fast lightweight
7. **ZAI GLM-4.6** - Chain-of-thought reasoning
8. **DeepSeek R1** - Reasoning with thinking process
9. **Qwen3 Coder** - Code specialist
10. **Mistral Small 24B** - Efficient chat
11. **Mistral Small 3.1** - Enhanced performance

#### 🏠 Local Models (2)
12. **Qwen 3 Local** - Privacy-focused (Ollama)
13. **GLM-4.6 Local** - Local reasoning (Ollama)

---

## 🔒 Security Checklist

- [ ] Enable Row Level Security (RLS) in Supabase
- [ ] Set up API key hashing (SHA-256)
- [ ] Configure rate limiting per user
- [ ] Enable HTTPS only
- [ ] Set secure session cookies
- [ ] Rotate API keys regularly
- [ ] Monitor usage analytics
- [ ] Set up webhook delivery logs

---

## 📊 Monitoring

### Vercel Dashboard
- Request logs
- Error tracking
- Performance metrics
- Bandwidth usage

### Supabase Dashboard
- Database queries
- Auth sessions
- API usage
- Storage metrics

### Custom Analytics
- Request history page
- Usage analytics dashboard
- Cost breakdown charts
- Model performance stats

---

## 🚨 Troubleshooting

### Rate Limits
- System automatically rotates through 5 keys for Groq and OpenRouter
- Monitor rate limit hits in request history
- Add more API keys if needed

### Model Errors
- Check API key validity
- Verify provider status pages
- Review error logs in Vercel
- Test individual models in console

### Database Issues
- Verify RLS policies
- Check Supabase connection
- Review migration status
- Monitor query performance

---

## 📈 Scaling Tips

1. **Add More API Keys**: Scale to 10+ keys per provider
2. **Enable Caching**: Cache responses for common queries
3. **Load Balancing**: Distribute across multiple regions
4. **CDN**: Use Vercel Edge for faster response times
5. **Database Optimization**: Index frequently queried columns

---

## 🔗 Useful Links

- **Groq Console**: https://console.groq.com
- **Chutes AI**: https://chutes.ai
- **Cerebras Docs**: https://cerebras.ai/docs
- **OpenRouter**: https://openrouter.ai
- **Ollama**: https://ollama.com
- **Supabase**: https://supabase.com
- **Vercel**: https://vercel.com

---

## 📝 Post-Deployment

1. Test all 13 models in console
2. Create demo API keys
3. Set up usage alerts
4. Configure webhooks
5. Monitor error rates
6. Review analytics daily
7. Update model list as needed

---

## 🎉 You're Live!

Your multi-cloud AI developer portal is now production-ready with:
- ✅ 13 AI models
- ✅ 4 cloud providers
- ✅ Rate limit protection
- ✅ Chain-of-thought reasoning
- ✅ Local privacy mode
- ✅ Real-time analytics
- ✅ Enterprise features

**API Endpoint**: `https://your-domain.vercel.app/api/chat`
**Dashboard**: `https://your-domain.vercel.app/dashboard`
