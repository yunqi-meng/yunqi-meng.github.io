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
echo [1/4] 安装/同步依赖（package.json 无变化时很快结束）...
echo 注意：首次安装 sharp 图片处理库可能需要编译，请耐心等待...
call npm install --no-audit --no-fund
if errorlevel 1 (
    echo [错误] npm install 失败，请检查网络与 package.json。
    echo 如果 sharp 安装失败，可能需要安装 Python 和 C++ 编译工具。
    pause
    exit /b 1
)

echo.
echo [2/4] 清理旧的生成文件...
call npx hexo clean
if errorlevel 1 (
    echo [警告] hexo clean 执行失败，继续后续步骤...
)

echo.
echo [3/4] 生成静态文件...
call npx hexo generate
if errorlevel 1 (
    echo [警告] hexo generate 执行失败，继续后续步骤...
)

echo.
echo [4/4] 正在启动后台（端口见 admin\server.js 中 PORT，默认 4007）...
echo 约 2 秒后自动打开浏览器
echo 停止服务：在本窗口按 Ctrl+C
echo ==========================================
echo.

start "" cmd /c "timeout /t 2 /nobreak >nul && start http://127.0.0.1:4007/"

node admin\server.js
echo.
echo 服务已结束。
pause
