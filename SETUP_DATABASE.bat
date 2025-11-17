@echo off
echo.
echo ========================================
echo   SUPABASE DATABASE SETUP
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo.
echo Loading environment variables from .env.local...
if not exist ".env.local" (
    echo ERROR: .env.local file not found!
    echo Please create .env.local with your Supabase credentials
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
call npm install @supabase/supabase-js

echo.
echo Running database migration...
call npx tsx scripts/setup-database.ts

echo.
echo ========================================
if errorlevel 1 (
    echo   SETUP FAILED - See errors above
) else (
    echo   SETUP COMPLETED SUCCESSFULLY!
)
echo ========================================
echo.
pause
