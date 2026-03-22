@echo off
chcp 65001 >nul
title Hexo 部署到 GitHub Pages
color 0B

echo ==========================================
echo    Hexo 部署脚本 - GitHub Pages
echo ==========================================
echo.

REM 检查是否在正确的目录
cd /d "%~dp0"

REM 检查 hexo 是否安装
hexo --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Hexo，请先安装 Hexo
    echo npm install -g hexo-cli
    pause
    exit /b 1
)

echo [1/3] 正在清理缓存...
hexo clean
if errorlevel 1 (
    echo [错误] 清理缓存失败
    pause
    exit /b 1
)
echo [1/3] 完成
echo.

echo [2/3] 正在生成静态文件...
hexo generate
if errorlevel 1 (
    echo [错误] 生成静态文件失败
    pause
    exit /b 1
)
echo [2/3] 完成
echo.

echo [3/3] 正在部署到 GitHub Pages...
hexo deploy
if errorlevel 1 (
    echo [错误] 部署失败
    pause
    exit /b 1
)
echo [3/3] 完成
echo.

echo ==========================================
echo    部署成功！
echo    访问地址：https://yunqi-meng.github.io
echo ==========================================
echo.

REM 自动打开网站
timeout /t 2 /nobreak >nul
start https://yunqi-meng.github.io

pause
