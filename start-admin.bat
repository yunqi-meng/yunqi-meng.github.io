@echo off
title Hexo Admin Server
color 0A

echo ==========================================
echo    Hexo Admin Server
echo ==========================================
echo.

cd /d "%~dp0"

echo [1/3] Cleaning cache...
call hexo clean
if errorlevel 1 (
    echo [ERROR] Clean failed
    pause
    exit /b 1
)
echo [1/3] Done
echo.

echo [2/3] Generating static files...
call hexo generate
if errorlevel 1 (
    echo [ERROR] Generate failed
    pause
    exit /b 1
)
echo [2/3] Done
echo.

echo [3/3] Starting server...
echo.
echo ==========================================
echo    Server started!
echo    URL: http://localhost:4000/admin
echo    Username: admin
echo    Press Ctrl+C to stop
echo ==========================================
echo.

timeout /t 2 /nobreak >nul
start http://localhost:4000/admin

call hexo server

pause
