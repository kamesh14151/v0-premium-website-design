d# AJStudioz AI Developer Portal - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Run Database Migration

**Go to Supabase SQL Editor:**
https://supabase.com/dashboard/project/hqfgblqxcqowiudrfioi/sql/new

**Copy and paste the entire SQL from:**
`supabase/migrations/001_initial_schema.sql`

Click "Run" to create all tables, policies, and indexes.

### 2. Install Dependencies
```bash
cd "c:\New folder\v0-developer-portal-design"
npm install --legacy-peer-deps
```

### 3. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

---

## ✅ What's Already Configured

### Database & Auth ✓
- Supabase URL: `https://hqfgblqxcqowiudrfioi.supabase.co`
- Database connection: PostgreSQL (Neon + Supabase)
- Authentication: Supabase Auth with email/password
- RLS Policies: ✓ Enabled for all tables

### AI Models ✓
- **13 Models** from 4 providers
- **API Endpoint**: https://api.ajstudioz.dev
- **Demo API Key**: `aj-demo123456789abcdef`

Models Available:
1. Kimi K2 Instruct (Groq)
2. Qwen 3 32B (Groq)
3. Llama 4 Maverick (Groq)
4. GPT OSS 20B (Groq)
5. GPT OSS 120B (Groq)
6. GLM-4.5 Air (Chutes)
7. ZAI GLM-4.6 (Cerebras)
8. DeepSeek R1 (OpenRouter)
9. Qwen3 Coder (OpenRouter)
10. Mistral Small 24B (OpenRouter)
11. Mistral Small 3.1 (OpenRouter)
12. Qwen 3 Local (Ollama)
13. GLM-4.6 Local (Ollama)

---

## 📝 Post-Setup Tasks

### Add Your Own API Keys (Optional)

Edit `.env.local` and add your keys:

```bash
# Groq (get from https://console.groq.com)
GROQ_API_KEY1=gsk_your_key_1
GROQ_API_KEY2=gsk_your_key_2
# ... up to GROQ_API_KEY5

# Chutes AI
CHUTES_API_TOKEN=your_token

# Cerebras
CEREBRAS_API_KEY=your_key

# OpenRouter
OPENROUTER_API_KEY1=sk-or-v1-your_key_1
# ... up to OPENROUTER_API_KEY5
```

---

## 🧪 Test the Portal

### 1. Test Chat Console
```
http://localhost:3000/dashboard/console
```
- Select any of 13 models
- Send test message
- See real-time response

### 2. Test Models Page
```
http://localhost:3000/dashboard/models
```
- View all 13 models
- Compare specifications
- See capabilities

### 3. Test API Endpoint
```bash
curl -X POST http://localhost:3000/api/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "kimi",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

---

## 📊 Features Working Out of Box

✅ **Multi-Cloud AI Platform**
- 13 models from 4 providers
- Automatic rate limit protection
- Chain-of-thought reasoning

✅ **Developer Console**
- Interactive chat interface
- Model comparison tool
- Real-time token counting

✅ **Database & Auth**
- User authentication
- API key management
- Request logging
- Usage analytics

✅ **Production Ready**
- Row Level Security (RLS)
- Error handling
- Performance optimized
- Supabase + Neon PostgreSQL

---

## 🔥 Deploy to Production

### Vercel (Recommended)
```bash
npm install -g vercel
vercel login
vercel --prod
```

Add environment variables in Vercel dashboard:
- Copy from `.env.local`
- Add to Vercel project settings
- Redeploy

### Manual Deployment
1. Build: `npm run build`
2. Upload to any Node.js host
3. Set environment variables
4. Start: `npm start`

---

## 🆘 Troubleshooting

### "Cannot connect to database"
- Check Supabase URL in `.env.local`
- Verify database migration ran successfully
- Test connection in Supabase dashboard

### "No models available"
- API endpoint is configured by default
- Uses demo API key (works immediately)
- Add your own keys for production

### "Authentication error"
- Sign up at: http://localhost:3000/auth/sign-up
- Check Supabase Auth is enabled
- Verify cookies are working

---

## 📚 Next Steps

1. ✅ Run database migration
2. ✅ Test chat console with 13 models
3. ✅ Create your account
4. ✅ Generate API keys
5. ✅ Deploy to Vercel
6. ✅ Add custom domain

---

## 🎉 You're Ready!

Your AJStudioz AI Developer Portal is now **production-ready** with:
- ✅ 13 AI models
- ✅ 4 cloud providers
- ✅ Multi-key rate limiting
- ✅ Chain-of-thought reasoning
- ✅ Full authentication
- ✅ Database configured
- ✅ OpenAI-compatible API

**Start developing**: http://localhost:3000
**API Documentation**: http://localhost:3000/dashboard/docs
**Model Comparison**: http://localhost:3000/dashboard/models

---

Need help? Check:
- `DEPLOYMENT.md` - Full deployment guide
- `README.md` - Project overview
- `.env.example` - All environment variables
