/**
 * 文章管理路由
 */

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { POSTS_DIR } = require('../server');
const { parseFrontMatter, generateFrontMatter, generateFileName, getFileInfo, ensureDir } = require('../utils/helpers');

/**
 * GET /api/posts - 获取所有文章列表
 */
router.get('/', async (req, res) => {
  try {
    const files = await fs.readdir(POSTS_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    const posts = await Promise.all(
      mdFiles.map(async fileName => {
        const filePath = path.join(POSTS_DIR, fileName);
        return await getFileInfo(filePath);
      })
    );
    
    // 按日期倒序排列
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({ success: true, posts });
  } catch (error) {
    console.error('Error reading posts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/posts/:fileName - 获取单篇文章
 */
router.get('/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(POSTS_DIR, fileName);
    
    // 安全检查：确保文件在 POSTS_DIR 内
    if (!filePath.startsWith(POSTS_DIR)) {
      return res.status(403).json({ success: false, error: 'Invalid file path' });
    }
    
    const post = await getFileInfo(filePath);
    res.json({ success: true, post });
  } catch (error) {
    console.error('Error reading post:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/posts - 创建新文章
 */
router.post('/', async (req, res) => {
  try {
    const { title, content, categories = [], tags = [], published = true } = req.body;
    
    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }
    
    const fileName = generateFileName(title);
    const filePath = path.join(POSTS_DIR, fileName);
    const assetFolderName = fileName.replace('.md', '');
    const assetFolderPath = path.join(POSTS_DIR, assetFolderName);
    
    // 检查文件是否已存在
    try {
      await fs.access(filePath);
      return res.status(409).json({ success: false, error: 'File already exists' });
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
      categories: Array.isArray(categories) ? categories : [categories].filter(Boolean),
      tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
      published
    };
    
    const fileContent = generateFrontMatter(frontMatter) + (content || '');
    
    // 写入文件
    await fs.writeFile(filePath, fileContent, 'utf-8');
    
    const post = await getFileInfo(filePath);
    res.json({ success: true, post, message: 'Article created successfully' });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/posts/:fileName - 更新文章
 */
router.put('/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const { title, content, categories, tags, published } = req.body;
    
    const filePath = path.join(POSTS_DIR, fileName);
    
    // 安全检查
    if (!filePath.startsWith(POSTS_DIR)) {
      return res.status(403).json({ success: false, error: 'Invalid file path' });
    }
    
    // 读取现有文件
    const existingContent = await fs.readFile(filePath, 'utf-8');
    const { frontMatter: existingFrontMatter } = parseFrontMatter(existingContent);
    
    // 更新 Front Matter
    const frontMatter = {
      ...existingFrontMatter,
      ...(title && { title }),
      ...(categories !== undefined && { categories: Array.isArray(categories) ? categories : [categories].filter(Boolean) }),
      ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : [tags].filter(Boolean) }),
      ...(published !== undefined && { published }),
      updated: new Date().toISOString()
    };
    
    const fileContent = generateFrontMatter(frontMatter) + (content !== undefined ? content : parseFrontMatter(existingContent).body);
    
    // 写入文件
    await fs.writeFile(filePath, fileContent, 'utf-8');
    
    const post = await getFileInfo(filePath);
    res.json({ success: true, post, message: 'Article updated successfully' });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/posts/:fileName - 删除文章
 */
router.delete('/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(POSTS_DIR, fileName);
    
    // 安全检查
    if (!filePath.startsWith(POSTS_DIR)) {
      return res.status(403).json({ success: false, error: 'Invalid file path' });
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
    
    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
