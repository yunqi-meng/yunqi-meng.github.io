const fetch = require('node-fetch');

const API_BASE = 'http://localhost:4007/api/admin';

async function testUploadAPI() {
    console.log('测试 upload API...');
    
    try {
        // 测试获取 test-latex 文章的图片列表
        const res = await fetch(API_BASE + '/upload/test-latex');
        console.log('API 响应状态:', res.status);
        
        if (res.ok) {
            const data = await res.json();
            console.log('API 响应数据:', JSON.stringify(data, null, 2));
            
            if (data.success && data.images) {
                console.log('图片数量:', data.images.length);
                data.images.forEach((image, index) => {
                    console.log(`图片 ${index + 1}:`);
                    console.log(`  filename: ${image.filename}`);
                    console.log(`  path: ${image.path}`);
                    console.log(`  完整路径: http://127.0.0.1:4007${image.path}`);
                });
            }
        } else {
            console.error('API 请求失败:', res.statusText);
        }
        
    } catch (error) {
        console.error('测试失败:', error);
    }
}

testUploadAPI();