/**
 * Hexo Admin - 本地博客管理后台
 * 端口: 4001
 * 访问: http://localhost:4001
 */

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);
const app = express();
const PORT = 4007;

// 项目根目录
const ROOT_DIR = path.dirname(__dirname);
const POSTS_DIR = path.join(ROOT_DIR, 'source', '_posts');

// 导出供路由使用
module.exports = { ROOT_DIR, POSTS_DIR };

// 中间件
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS - 必须在路由之前
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// 静态文件服务 - 文章资源文件夹（图片等）
// 将 /posts-assets 映射到 source/_posts 目录
app.use('/posts-assets', express.static(POSTS_DIR));

// 路由
const postsRouter = require('./routes/posts');
const deployRouter = require('./routes/deploy');
const configRouter = require('./routes/config');
const uploadRouter = require('./routes/upload');
const imagesRouter = require('./routes/images');

app.use('/api/posts', postsRouter);
app.use('/api/deploy', deployRouter);
app.use('/api/config', configRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/images', imagesRouter);

// 主页
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
app.listen(PORT, '127.0.0.1', () => {
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
