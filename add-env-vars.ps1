# Add all environment variables to Vercel
$envVars = @{
    "NEXT_PUBLIC_SUPABASE_ANON_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZmdibHF4Y3Fvd2l1ZHJmaW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzM4NDQsImV4cCI6MjA3ODk0OTg0NH0.rIg9UUKf0_GULy_q8KR5nQ3sIGRHXs5eBxKC1EnIbR4"
    "SUPABASE_SERVICE_ROLE_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZmdibHF4Y3Fvd2l1ZHJmaW9pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM3Mzg0NCwiZXhwIjoyMDc4OTQ5ODQ0fQ.YjWqXKQoa31UlJ07YoykdnHgRWWd2b7l1vv09gYUOeQ"
    "DATABASE_URL" = "postgresql://neondb_owner:npg_BPXRWnT32eGb@ep-wispy-hall-adgarnff-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
    "POSTGRES_PRISMA_URL" = "postgres://postgres.hqfgblqxcqowiudrfioi:eQKe78WkIi11ESJs@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
    "POSTGRES_URL" = "postgres://postgres.hqfgblqxcqowiudrfioi:eQKe78WkIi11ESJs@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
    "NEXT_PUBLIC_API_URL" = "https://api.ajstudioz.dev"
    "AJSTUDIOZ_API_KEY" = "aj-demo123456789abcdef"
    "NEXT_PUBLIC_STACK_PROJECT_ID" = "61650a80-89e8-4ce9-b142-342e1ee8a895"
    "NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY" = "pck_a4dmcarmt53hx5jcbjcm3590wbfh8brz94qnf37getvnr"
    "STACK_SECRET_SERVER_KEY" = "ssk_3dwnch5f5ajncy56mv0ccvd664syrcqjth1gvg8etnbhg"
    "NODE_ENV" = "production"
}

foreach ($key in $envVars.Keys) {
    Write-Host "Adding $key..." -ForegroundColor Cyan
    $value = $envVars[$key]
    echo $value | vercel env add $key production
    Start-Sleep -Milliseconds 500
}

Write-Host "`n✅ All environment variables added!" -ForegroundColor Green
Write-Host "Note: AI provider API keys need to be added manually" -ForegroundColor Yellow
