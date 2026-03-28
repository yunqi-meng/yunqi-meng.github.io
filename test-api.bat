@echo off

echo 测试管理后台 API 端点...
echo ========================================

rem 测试文章列表
echo 1. 测试文章列表 API...
curl -X GET http://localhost:4007/api/admin/posts/list

echo.
echo 2. 测试页面列表 API...
curl -X GET http://localhost:4007/api/admin/pages/list

echo.
echo 3. 测试健康检查...
curl -X GET http://localhost:4007/api/health

echo.
echo 测试完成！
echo ========================================
pause