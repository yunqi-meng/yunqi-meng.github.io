/**
 * 管理后台功能测试脚本
 * 用于验证所有核心 API 功能是否正常
 */

const http = require('http');
const BASE_URL = 'http://localhost:4007';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAPI(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function runTests() {
  log('\n=========================================', 'blue');
  log('   博客管理后台功能测试', 'blue');
  log('=========================================\n', 'blue');

  const tests = [
    { name: '健康检查', endpoint: '/api/health' },
    { name: '获取文章列表', endpoint: '/api/posts' },
    { name: '获取图片资源', endpoint: '/api/images' },
    { name: '获取配置列表', endpoint: '/api/config' },
    { name: '获取站点配置', endpoint: '/api/config/site' },
    { name: '获取主题配置', endpoint: '/api/config/theme' }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      log(`📋 测试：${test.name}...`, 'yellow');
      const result = await testAPI(test.endpoint);
      
      if (result.statusCode === 200) {
        log(`✅ 通过 - ${test.name}`, 'green');
        passed++;
      } else {
        log(`❌ 失败 - ${test.name} (状态码：${result.statusCode})`, 'red');
        failed++;
      }
    } catch (error) {
      log(`❌ 错误 - ${test.name}: ${error.message}`, 'red');
      failed++;
    }
  }

  log('\n=========================================', 'blue');
  log(`测试结果：${passed} 通过，${failed} 失败`, passed === 0 && failed > 0 ? 'red' : (failed === 0 ? 'green' : 'yellow'));
  log('=========================================\n', 'blue');

  if (failed === 0) {
    log('🎉 所有测试通过！管理后台运行正常。', 'green');
  } else {
    log('⚠️  部分测试失败，请检查管理后台是否正常运行。', 'yellow');
    log('提示：使用 start-admin.bat 启动管理后台', 'yellow');
  }
}

// 运行测试
runTests().catch(err => {
  log(`\n❌ 测试执行失败：${err.message}`, 'red');
  process.exit(1);
});
