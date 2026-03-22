@echo off
chcp 65001 >nul
echo ====================================
echo   Hexo 博客一键部署脚本
echo ====================================
echo.

echo [1/3] 清理缓存...
call hexo clean
if %errorlevel% neq 0 (
    echo 清理失败！
    pause
    exit /b 1
)
echo 清理完成！
echo.

echo [2/3] 生成静态文件...
call hexo generate
if %errorlevel% neq 0 (
    echo 生成失败！
    pause
    exit /b 1
)
echo 生成完成！
echo.

echo [3/3] 部署到 GitHub Pages...
call hexo deploy
if %errorlevel% neq 0 (
    echo 部署失败！
    pause
    exit /b 1
)
echo 部署完成！
echo.

echo ====================================
echo   部署成功！
echo ====================================
echo.
pause
