const fetch = require('node-fetch');

const API_BASE = 'http://localhost:4007/api/admin';

async function testAPI() {
    console.log('测试API端点...');
    
    try {
        // 测试文章列表API
        const postsRes = await fetch(API_BASE + '/posts/list');
        console.log('文章列表API状态:', postsRes.status);
        
        if (postsRes.ok) {
            const posts = await postsRes.json();
            console.log('文章数据:', posts);
        } else {
            console.error('文章列表API失败:', postsRes.statusText);
        }
        
        // 测试部署API
        const deployRes = await fetch(API_BASE + '/deploy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Test deploy' })
        });
        console.log('部署API状态:', deployRes.status);
        
        if (deployRes.ok) {
            const deployResult = await deployRes.json();
            console.log('部署结果:', deployResult);
        } else {
            console.error('部署API失败:', deployRes.statusText);
        }
        
    } catch (error) {
        console.error('API测试失败:', error);
    }
}

testAPI();