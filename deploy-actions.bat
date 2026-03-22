@echo off
title Deploy via GitHub Actions
color 0A

cd /d "%~dp0"

echo.
echo ==========================================
echo    Deploy via GitHub Actions
echo ==========================================
echo.

echo [1/4] Checking git status...
git status --short
if errorlevel 1 (
    echo [ERROR] Git status check failed
    pause
    exit /b 1
)
echo.

echo [2/4] Adding changes...
git add .
if errorlevel 1 (
    echo [ERROR] Git add failed
    pause
    exit /b 1
)
echo.

echo [3/4] Committing changes...
git commit -m "update: %date% %time%"
if errorlevel 1 (
    echo [INFO] No changes to commit
    echo.
    echo ==========================================
    echo    No changes detected
    echo ==========================================
    pause
    exit /b 0
)
echo.

echo [4/4] Pushing to main branch...
git push origin main
if errorlevel 1 (
    echo [ERROR] Git push failed
    echo.
    echo Possible reasons:
    echo - Network connection issue
    echo - Git credentials expired
    echo - Branch conflict
    pause
    exit /b 1
)
echo.

echo ==========================================
echo    Successfully pushed to main!
echo.
echo    GitHub Actions is now deploying...
echo    Website: https://yunqi-meng.github.io
echo    Actions: https://github.com/yunqi-meng/yunqi-meng.github.io/actions
echo.
echo    Deployment will complete in 1-2 minutes
echo ==========================================
echo.
pause
