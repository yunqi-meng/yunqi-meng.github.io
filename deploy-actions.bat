@echo off
title Deploy Blog
color 0A
setlocal enabledelayedexpansion

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

echo [1/3] Checking git changes...

:: Check if git repository exists
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Not a git repository
    pause
    exit /b 1
)

:: Check for uncommitted changes (staged or unstaged)
git diff --quiet HEAD
set has_unstaged=!errorlevel!
git diff --cached --quiet
set has_staged=!errorlevel!

if !has_unstaged! equ 0 if !has_staged! equ 0 (
    echo.
    echo ==========================================
    echo    No changes to commit
    echo    Working tree is clean
    echo ==========================================
    pause
    goto end
)

:: Show current status
git status --short

echo.
echo [2/3] Committing changes...
git add .

:: Generate timestamp without colons (avoid Windows time format issues)
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=: " %%a in ('time /t') do (set mytime=%%a%%b)
set timestamp=!mydate! !mytime!

git commit -m "deploy: !timestamp!"
if errorlevel 1 (
    echo.
    echo ==========================================
    echo    Commit failed or nothing to commit
    echo ==========================================
    pause
    goto end
)

echo.
echo [3/3] Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo [ERROR] Push failed!
    pause
    exit /b 1
)

echo.
echo ==========================================
echo    Successfully pushed!
echo.
echo    GitHub Actions is building...
echo    Website: https://yunqi-meng.github.io
echo    Actions: https://github.com/yunqi-meng/yunqi-meng.github.io/actions
echo ==========================================
pause
goto end

:generate
echo.
echo ==========================================
echo    Clean and Generate
echo ==========================================
echo.
call hexo clean
call hexo generate
echo.
echo ==========================================
echo    Generated successfully!
echo ==========================================
pause
goto end

:server
echo.
echo ==========================================
echo    Starting Local Server
echo ==========================================
echo.
echo    Server: http://localhost:4000
timeout /t 1 /nobreak >nul
start http://localhost:4000
call hexo server
goto end

:end
echo.
echo    Thank you for using Hexo Blog Deployment Tool
echo.