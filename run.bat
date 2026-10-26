@echo off
title TRENDIE MODELS -- Agency Platform
echo ============================================================
echo   TRENDIE MODELS -- ACCRA GHANA TALENT PLATFORM
echo ============================================================
echo.
cd /d "%~dp0"

where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] pnpm is not installed or not in PATH.
    echo Please install pnpm: npm install -g pnpm
    pause
    exit /b 1
)

echo [INFO] Launching Trendie Models Platform (Frontend + API Server)...
echo [INFO] URL: http://localhost:3000
timeout /t 2 /nobreak >nul
start http://localhost:3000
call pnpm run dev:all
pause
