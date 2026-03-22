@echo off
title Deploy Blog
color 0A

cd /d "%~dp0"

echo.
echo ==========================================
echo    Hexo Blog Deployment Tool
echo ==========================================
echo.
echo    1. Deploy to GitHub Pages (via Actions)
echo    2. Clean and Generate Only
echo    3. Start Local Server
echo    4. Exit
echo.
set /p choice="Please select (1-4): "

if "%choice%"=="1" goto deploy
if "%choice%"=="2" goto generate
if "%choice%"=="3" goto server
if "%choice%"=="4" goto end
echo Invalid choice
pause
goto end

:deploy
echo.
echo ==========================================
echo    Deploying to GitHub Pages
echo ==========================================
echo.

echo [1/5] Cleaning cache...
call hexo clean
if errorlevel 1 (
    echo [ERROR] Clean failed
    pause
    exit /b 1
)
echo.

echo [2/5] Generating static files...
call hexo generate
if errorlevel 1 (
    echo [ERROR] Generate failed
    pause
    exit /b 1
)
echo.

echo [3/5] Checking git status...
git status --short
if errorlevel 1 (
    echo [ERROR] Git status check failed
    pause
    exit /b 1
)
echo.

echo [4/5] Adding changes...
git add .
if errorlevel 1 (
    echo [ERROR] Git add failed
    pause
    exit /b 1
)
echo.

echo [5/5] Committing and pushing...
git commit -m "deploy: %date% %time%"
if errorlevel 1 (
    echo [INFO] No changes to commit
    echo.
    echo ==========================================
    echo    No changes detected
    echo ==========================================
    pause
    goto end
)

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
pause
goto end

:generate
echo.
echo ==========================================
echo    Clean and Generate
echo ==========================================
echo.

echo [1/2] Cleaning cache...
call hexo clean
if errorlevel 1 (
    echo [ERROR] Clean failed
    pause
    exit /b 1
)
echo.

echo [2/2] Generating static files...
call hexo generate
if errorlevel 1 (
    echo [ERROR] Generate failed
    pause
    exit /b 1
)
echo.

echo ==========================================
echo    Generated successfully!
echo    Files are in ./public folder
echo ==========================================
pause
goto end

:server
echo.
echo ==========================================
echo    Starting Local Server
echo ==========================================
echo.
echo    Server will start at: http://localhost:4000
echo    Press Ctrl+C to stop
echo.
timeout /t 2 /nobreak >nul
start http://localhost:4000
call hexo server
goto end

:end
echo.
echo    Thank you for using Hexo Blog Deployment Tool
echo.
