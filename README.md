# AJStudioz AI Developer Portal

A production-ready multi-cloud AI developer platform built with Next.js 16, Supabase, and OpenAI-compatible API.

## Features

### Core Features
- **Multi-Cloud LLM Integration**: 13 AI models (11 cloud + 2 local) from 4 providers
  - **Groq**: Kimi, Qwen3, Llama-4, GPT-OSS (20B & 120B)
  - **Chutes AI**: GLM-4.5 Air
  - **Cerebras**: ZAI GLM-4.6
  - **OpenRouter**: DeepSeek R1, Qwen3 Coder, Mistral Small (24B & 3.1)
  - **Local Ollama**: Qwen3 1.7B, GLM-4.6 (privacy mode)
- **Advanced Chat Console**: Interactive testing with 13 models, typing effects, and real-time token counting
- **Chain-of-Thought Reasoning**: Automatic extraction for reasoning models (DeepSeek R1, GLM-4.6)
- **Rate Limit Protection**: Multi-key rotation for Groq (5 keys) and OpenRouter (5 keys)
- **API Key Management**: Secure key generation, rotation, and granular permissions
- **Request Logging**: Detailed request history with filtering, search, and export
- **Usage Analytics**: Real-time dashboards with charts, trends, and cost breakdowns

### Team & Enterprise
- **Team Management**: Role-based access control (Owner/Admin/Member)
- **Billing System**: Tiered pricing plans with usage-based billing
- **Admin Dashboard**: System metrics, user management, and platform analytics
- **Webhooks**: Event-based integrations with delivery logs

### Technical Highlights
- **Database**: Supabase with Row Level Security for data protection
- **Streaming**: Server-Sent Events for real-time response streaming
- **Authentication**: Email/password with Supabase Auth
- **Rate Limiting**: Per-user rate limits with quota management
- **Caching**: Response caching for cost optimization

## Architecture

### Database Schema
\`\`\`
- profiles: User data
- api_keys: Secure API key storage with hashing
- request_history: Complete request logging with metrics
- usage_metrics: Monthly usage tracking for billing
- subscription_plans: User tier and limits
- teams: Team data with ownership
- team_members: Team membership with roles
- webhooks: User webhooks with delivery logs
\`\`\`

### API Routes
- `/api/chat/completions` - LLM completions with streaming
- `/api/analytics/summary` - Usage analytics
- `/api/request-log` - Request history
- `/api/team/invite` - Team invitations
- `/api/team/members` - Team member management
- `/api/billing/subscription` - Subscription management
- `/api/admin/system` - System metrics
- `/api/admin/users` - User management
- `/api/keys/validate` - API key validation
- `/api/rate-limit/check` - Rate limit checks
- `/api/usage/quota` - Quota information

## Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role
- `DATABASE_URL` - Neon PostgreSQL connection

AI Provider API Keys (Multi-Cloud):
- `GROQ_API_KEY1` through `GROQ_API_KEY5` - Groq API keys (5 keys for rate limit protection)
- `CHUTES_API_TOKEN` - Chutes AI API key
- `CEREBRAS_API_KEY` - Cerebras AI API key
- `OPENROUTER_API_KEY1` through `OPENROUTER_API_KEY5` - OpenRouter API keys (5 keys for rate limit protection)
- `OLLAMA_URL` - Local Ollama server URL (default: http://localhost:11434)

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set environment variables
4. Run migrations: `npm run db:migrate`
5. Start development: `npm run dev`

## Production Deployment

1. Use Vercel for deployment
2. Set environment variables in Vercel dashboard
3. Run database migrations
4. Monitor via admin dashboard

## Security

- All data protected with Row Level Security (RLS)
- API keys hashed with SHA-256
- Rate limiting per API key
- CSRF protection
- Secure session management with cookies
