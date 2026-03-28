/**
 * Hexo Admin - 本地博客管理后台
 * 端口: 4007（与 source/admin/index.html 中 API 一致）
 * 访问: http://localhost:4007
 */

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);
const app = express();
const PORT = 4007;

const { ROOT_DIR, POSTS_DIR } = require('./paths');

// 中间件
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// 静态文件服务 - 文章资源文件夹（图片等）
// 将 /posts-assets 映射到 source/_posts 目录
app.use('/posts-assets', express.static(POSTS_DIR));

// CORS - 仅允许本地访问
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// 路由
const postsRouter = require('./routes/posts');
const deployRouter = require('./routes/deploy');
const configRouter = require('./routes/config');
const uploadRouter = require('./routes/upload');
const adminRouter = require('./routes/admin');

app.use('/api/admin', adminRouter);
app.use('/api/posts', postsRouter);
app.use('/api/deploy', deployRouter);
app.use('/api/config', configRouter);
app.use('/api/upload', uploadRouter);

// 主页 - 提供 source/admin/index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'source', 'admin', 'index.html'));
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// 启动服务器
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║     🚀 Hexo Admin 管理后台已启动                          ║
║                                                          ║
║     访问地址: http://localhost:${PORT}                    ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `[admin] 端口 ${PORT} 已被占用（可能已有后台在运行）。请关闭占用进程或修改 admin/server.js 中的 PORT。`
    );
  } else {
    console.error('[admin] 启动失败:', err.message);
  }
  process.exit(1);
});
