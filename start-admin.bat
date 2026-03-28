@echo off
chcp 65001 >nul 2>&1
title Hexo 博客管理后台
cd /d "%~dp0"

where node >nul 2>&1 || (
    echo [错误] 未检测到 Node.js，请先安装并加入 PATH。
    pause
    exit /b 1
)

where npm >nul 2>&1 || (
    echo [错误] 未检测到 npm，请重新安装 Node.js。
    pause
    exit /b 1
)

if not exist "admin\server.js" (
    echo [错误] 未找到 admin\server.js，请在本仓库根目录运行此脚本。
    pause
    exit /b 1
)

echo ==========================================
echo    Hexo Admin 一键启动
echo ==========================================
echo.
echo [1/3] 安装/同步依赖（package.json 无变化时很快结束）...
call npm install --no-audit --no-fund
if errorlevel 1 (
    echo [错误] npm install 失败，请检查网络与 package.json。
    pause
    exit /b 1
)

echo.
echo [2/3] 正在启动后台（端口见 admin\server.js 中 PORT，默认 4007）...
echo [3/3] 约 2 秒后自动打开浏览器
echo 停止服务: 在本窗口按 Ctrl+C
echo ==========================================
echo.

start "" cmd /c "timeout /t 2 /nobreak >nul && start http://127.0.0.1:4007/"

node admin\server.js
echo.
echo 服务已结束。
pause
