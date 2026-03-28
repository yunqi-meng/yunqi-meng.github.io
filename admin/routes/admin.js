/**
 * Hexo Admin 兼容路由
 * 提供与 hexo-admin 兼容的 API 端点
 */

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { POSTS_DIR, ROOT_DIR } = require('../paths');
const { parseFrontMatter, generateFrontMatter, generateFileName, getFileInfo, ensureDir, isPathInside } = require('../utils/helpers');

/**
 * GET /api/posts/list - 获取所有文章列表
 */
router.get('/posts/list', async (req, res) => {
  try {
    const files = await fs.readdir(POSTS_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    const posts = await Promise.all(
      mdFiles.map(async fileName => {
        const filePath = path.join(POSTS_DIR, fileName);
        const post = await getFileInfo(filePath);
        
        return {
          _id: fileName,
          title: post.title,
          date: post.date,
          path: `/${post.fileName.replace('.md', '')}`,
          isDraft: !post.published,
          isDiscarded: false,
          raw: post.body,
          content: post.body
        };
      })
    );
    
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(posts);
  } catch (error) {
    console.error('Error reading posts:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/posts/new - 创建新文章
 */
router.post('/posts/new', async (req, res) => {
  try {
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const fileName = generateFileName(title);
    const filePath = path.join(POSTS_DIR, fileName);
    const assetFolderName = fileName.replace('.md', '');
    const assetFolderPath = path.join(POSTS_DIR, assetFolderName);
    
    // 检查文件是否已存在
    try {
      await fs.access(filePath);
      return res.status(409).json({ error: 'File already exists' });
    } catch {
      // 文件不存在，继续创建
    }
    
    // 创建资源文件夹
    await ensureDir(assetFolderPath);
    
    // 生成 Front Matter
    const now = new Date();
    const frontMatter = {
      title,
      date: now.toISOString(),
      cover: '/images/default.jpg',
      categories: [],
      tags: [],
      published: false
    };
    
    const fileContent = generateFrontMatter(frontMatter) + '\n\n请在此处输入文章内容...';
    
    // 写入文件
    await fs.writeFile(filePath, fileContent, 'utf-8');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/posts/:fileName - 更新文章
 */
router.post('/posts/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const { title, content } = req.body;
    
    const filePath = path.join(POSTS_DIR, fileName);
    
    // 安全检查
    if (!isPathInside(filePath, POSTS_DIR)) {
      return res.status(403).json({ error: 'Invalid file path' });
    }
    
    // 读取现有文件
    const existingContent = await fs.readFile(filePath, 'utf-8');
    const { frontMatter: existingFrontMatter } = parseFrontMatter(existingContent);
    
    // 更新 Front Matter
    const frontMatter = {
      ...existingFrontMatter,
      ...(title && { title }),
      updated: new Date().toISOString()
    };
    
    const fileContent = generateFrontMatter(frontMatter) + (content !== undefined ? content : parseFrontMatter(existingContent).body);
    
    // 写入文件
    await fs.writeFile(filePath, fileContent, 'utf-8');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/posts/:fileName/remove - 删除文章
 */
router.post('/posts/:fileName/remove', async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(POSTS_DIR, fileName);
    
    // 安全检查
    if (!isPathInside(filePath, POSTS_DIR)) {
      return res.status(403).json({ error: 'Invalid file path' });
    }
    
    // 删除文章文件
    await fs.unlink(filePath);
    
    // 删除对应的资源文件夹
    const assetFolderName = fileName.replace('.md', '');
    const assetFolderPath = path.join(POSTS_DIR, assetFolderName);
    
    try {
      await fs.rm(assetFolderPath, { recursive: true, force: true });
    } catch {
      // 文件夹可能不存在，忽略错误
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/posts/:fileName/publish - 发布文章
 */
router.post('/posts/:fileName/publish', async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(POSTS_DIR, fileName);
    
    // 安全检查
    if (!isPathInside(filePath, POSTS_DIR)) {
      return res.status(403).json({ error: 'Invalid file path' });
    }
    
    // 读取现有文件
    const existingContent = await fs.readFile(filePath, 'utf-8');
    const { frontMatter: existingFrontMatter } = parseFrontMatter(existingContent);
    
    // 更新 Front Matter
    const frontMatter = {
      ...existingFrontMatter,
      published: true,
      updated: new Date().toISOString()
    };
    
    const fileContent = generateFrontMatter(frontMatter) + parseFrontMatter(existingContent).body;
    
    // 写入文件
    await fs.writeFile(filePath, fileContent, 'utf-8');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error publishing post:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/posts/:fileName/unpublish - 取消发布文章
 */
router.post('/posts/:fileName/unpublish', async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(POSTS_DIR, fileName);
    
    // 安全检查
    if (!isPathInside(filePath, POSTS_DIR)) {
      return res.status(403).json({ error: 'Invalid file path' });
    }
    
    // 读取现有文件
    const existingContent = await fs.readFile(filePath, 'utf-8');
    const { frontMatter: existingFrontMatter } = parseFrontMatter(existingContent);
    
    // 更新 Front Matter
    const frontMatter = {
      ...existingFrontMatter,
      published: false,
      updated: new Date().toISOString()
    };
    
    const fileContent = generateFrontMatter(frontMatter) + parseFrontMatter(existingContent).body;
    
    // 写入文件
    await fs.writeFile(filePath, fileContent, 'utf-8');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error unpublishing post:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/pages/list - 获取所有页面列表
 */
router.get('/pages/list', async (req, res) => {
  try {
    const pagesDir = path.join(ROOT_DIR, 'source');
    const files = await fs.readdir(pagesDir);

    const pageFiles = [];
    for (const f of files) {
      if (!f.endsWith('.md') || f.startsWith('_')) continue;
      const filePath = path.join(pagesDir, f);
      const stat = await fs.stat(filePath);
      if (stat.isFile()) pageFiles.push(f);
    }
    
    const pages = await Promise.all(
      pageFiles.map(async fileName => {
        const filePath = path.join(pagesDir, fileName);
        const post = await getFileInfo(filePath);
        
        return {
          _id: fileName,
          title: post.title,
          date: post.date,
          path: `/${fileName.replace('.md', '')}`,
          raw: post.body,
          content: post.body
        };
      })
    );
    
    res.json(pages);
  } catch (error) {
    console.error('Error reading pages:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/pages/:fileName - 更新页面
 */
router.post('/pages/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const { title, content } = req.body;
    
    const pagesDir = path.join(ROOT_DIR, 'source');
    const filePath = path.join(pagesDir, fileName);
    
    // 安全检查
    if (!isPathInside(filePath, pagesDir)) {
      return res.status(403).json({ error: 'Invalid file path' });
    }
    
    // 读取现有文件
    const existingContent = await fs.readFile(filePath, 'utf-8');
    const { frontMatter: existingFrontMatter } = parseFrontMatter(existingContent);
    
    // 更新 Front Matter
    const frontMatter = {
      ...existingFrontMatter,
      ...(title && { title }),
      updated: new Date().toISOString()
    };
    
    const fileContent = generateFrontMatter(frontMatter) + (content !== undefined ? content : parseFrontMatter(existingContent).body);
    
    // 写入文件
    await fs.writeFile(filePath, fileContent, 'utf-8');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/images/upload - 上传图片
 */
router.post('/images/upload', async (req, res) => {
  try {
    const { data, filename } = req.body;
    
    if (!data || !filename) {
      return res.status(400).json({ error: 'Image data and filename are required' });
    }
    
    // 构建上传目录
    const uploadDir = path.join(ROOT_DIR, 'source', 'images');
    await ensureDir(uploadDir);
    
    // 清理文件名
    const cleanFilename = filename
      .replace(/[^\w.-]/g, '_')
      .toLowerCase();
    
    // 确定文件扩展名
    let ext = path.extname(cleanFilename);
    if (!ext) {
      if (data.includes('image/png')) {
        ext = '.png';
      } else if (data.includes('image/jpeg') || data.includes('image/jpg')) {
        ext = '.jpg';
      } else if (data.includes('image/gif')) {
        ext = '.gif';
      } else if (data.includes('image/webp')) {
        ext = '.webp';
      } else {
        ext = '.png';
      }
    }
    
    const finalFilename = cleanFilename.replace(/\.[^.]+$/, '') + ext;
    const filePath = path.join(uploadDir, finalFilename);
    
    // 解码 base64 图片数据
    let base64Data = data;
    if (data.includes(',')) {
      base64Data = data.split(',')[1];
    }
    
    // 写入文件
    await fs.writeFile(filePath, Buffer.from(base64Data, 'base64'));
    
    // 返回图片路径
    const imagePath = `/images/${finalFilename}`;
    
    res.json({ path: imagePath });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/deploy - 部署网站
 */
router.post('/deploy', async (req, res) => {
  try {
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    
    // 添加文件
    await execPromise('git add .', { cwd: ROOT_DIR });
    
    // 提交
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    
    try {
      await execPromise(`git commit -m "deploy: ${timestamp}"`, { cwd: ROOT_DIR });
    } catch (commitErr) {
      if (!commitErr.message.includes('nothing to commit')) {
        throw commitErr;
      }
    }
    
    // 推送
    await execPromise('git push origin main', { cwd: ROOT_DIR });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deploying:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
