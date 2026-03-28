@echo off
title Hexo Admin
color 0A

echo ==========================================
echo    Hexo Admin - Custom Admin Panel
echo ==========================================
echo.

cd /d "%~dp0"

echo Starting custom admin backend...
echo.
echo ==========================================
echo    Admin Server Started!
echo.
echo    Admin Panel: http://localhost:4007
echo    API Endpoint: http://localhost:4007/api
echo.
echo    Press Ctrl+C to stop
echo ==========================================
echo.

timeout /t 2 /nobreak >nul
start http://localhost:4007
node admin/server.js

pause
