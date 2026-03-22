@echo off
title Deploy via GitHub Actions
color 0A

cd /d "%~dp0"

echo ==========================================
echo    Deploy via GitHub Actions
echo ==========================================
echo.

echo [1/2] Adding changes...
git add .
if errorlevel 1 (
    echo [ERROR] Git add failed
    pause
    exit /b 1
)
echo.

echo [2/2] Committing and pushing to main...
git commit -m "update: %date% %time%"
git push origin main
if errorlevel 1 (
    echo [ERROR] Git push failed
    pause
    exit /b 1
)
echo.

echo ==========================================
echo    Pushed to main branch!
echo    GitHub Actions will deploy automatically.
echo    Website: https://yunqi-meng.github.io
echo ==========================================
pause
