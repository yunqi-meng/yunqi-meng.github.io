@echo off
title Deploy and Backup
color 0A

cd /d "%~dp0"

echo ==========================================
echo    Deploy Blog and Backup Source
echo ==========================================
echo.

echo [1/4] Cleaning cache...
call hexo clean
if errorlevel 1 (
    echo [ERROR] Clean failed
    pause
    exit /b 1
)
echo.

echo [2/4] Generating static files...
call hexo generate
if errorlevel 1 (
    echo [ERROR] Generate failed
    pause
    exit /b 1
)
echo.

echo [3/4] Deploying to GitHub Pages...
call hexo deploy
if errorlevel 1 (
    echo [ERROR] Deploy failed
    pause
    exit /b 1
)
echo.

echo [4/4] Backing up source code...
git add .
git commit -m "update: %date% %time%"
git push origin main
echo.

echo ==========================================
echo    All done!
echo    Website: https://yunqi-meng.github.io
echo ==========================================
pause
