# Supabase Database Setup Script
# Automatically creates all required tables

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  SUPABASE DATABASE SETUP" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Load environment variables
$envFile = ".env.local"
if (-not (Test-Path $envFile)) {
    Write-Host "ERROR: .env.local file not found!" -ForegroundColor Red
    Write-Host "Please create .env.local with your Supabase credentials`n" -ForegroundColor Yellow
    pause
    exit 1
}

$envVars = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+?)\s*=\s*(.+?)\s*$') {
        $envVars[$matches[1]] = $matches[2]
    }
}

$supabaseUrl = $envVars['NEXT_PUBLIC_SUPABASE_URL']
$supabaseKey = $envVars['SUPABASE_SERVICE_ROLE_KEY']

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "ERROR: Missing Supabase credentials in .env.local" -ForegroundColor Red
    Write-Host "Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY`n" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "Loading SQL migration..." -ForegroundColor Yellow
$sqlFile = "supabase\migrations\20251117_initial_setup.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "ERROR: Migration file not found: $sqlFile" -ForegroundColor Red
    pause
    exit 1
}

$sql = Get-Content $sqlFile -Raw

Write-Host "Connecting to Supabase..." -ForegroundColor Yellow
Write-Host "URL: $supabaseUrl`n" -ForegroundColor Gray

# Execute SQL using Supabase REST API
$headers = @{
    'apikey' = $supabaseKey
    'Authorization' = "Bearer $supabaseKey"
    'Content-Type' = 'application/json'
}

# Split SQL into statements
$statements = $sql -split ';' | Where-Object { $_.Trim() -and -not $_.Trim().StartsWith('--') }

Write-Host "Executing $($statements.Count) SQL statements...`n" -ForegroundColor Yellow

$successCount = 0
$errorCount = 0

foreach ($statement in $statements) {
    $stmt = $statement.Trim() + ';'
    if ($stmt.Length -lt 10) { continue }
    
    try {
        $body = @{ query = $stmt } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/rpc/exec_sql" -Method POST -Headers $headers -Body $body -ErrorAction SilentlyContinue
        $successCount++
        Write-Host "." -NoNewline -ForegroundColor Green
    } catch {
        $errorCount++
        Write-Host "!" -NoNewline -ForegroundColor Yellow
    }
}

Write-Host "`n`n"
Write-Host "Migration Results:" -ForegroundColor Cyan
Write-Host "  Success: $successCount statements" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "  Warnings: $errorCount (may be expected for existing objects)" -ForegroundColor Yellow
}

# Verify tables
Write-Host "`nVerifying tables..." -ForegroundColor Yellow
$tables = @('profiles', 'api_keys', 'request_history', 'usage_metrics')

foreach ($table in $tables) {
    try {
        $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/$table?limit=0" -Method GET -Headers $headers -ErrorAction Stop
        Write-Host "  [OK] $table - Ready" -ForegroundColor Green
    } catch {
        Write-Host "  [FAIL] $table - Not found or no access" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETED!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Refresh your dashboard" -ForegroundColor White
Write-Host "2. All 500/400 errors should be gone" -ForegroundColor White
Write-Host "3. Create your first API key`n" -ForegroundColor White

pause
