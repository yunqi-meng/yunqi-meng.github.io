/**
 * 图片上传路由
 */

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { POSTS_DIR } = require('../server');

/**
 * POST /api/upload/:postName - 上传图片到文章资源文件夹
 */
router.post('/:postName', async (req, res) => {
  try {
    const { postName } = req.params;
    const { image, filename } = req.body;
    
    if (!image || !filename) {
      return res.status(400).json({ 
        success: false, 
        error: 'Image data and filename are required' 
      });
    }
    
    // 验证 postName 安全性
    if (postName.includes('..') || postName.includes('/') || postName.includes('\\')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid post name' 
      });
    }
    
    // 构建资源文件夹路径
    const assetFolderPath = path.join(POSTS_DIR, postName);
    
    // 检查资源文件夹是否存在
    try {
      await fs.access(assetFolderPath);
    } catch {
      // 创建资源文件夹
      await fs.mkdir(assetFolderPath, { recursive: true });
    }
    
    // 清理文件名
    const cleanFilename = filename
      .replace(/[^\w.-]/g, '_')
      .toLowerCase();
    
    // 确定文件扩展名
    let ext = path.extname(cleanFilename);
    if (!ext) {
      // 从 base64 数据判断类型
      if (image.includes('image/png')) {
        ext = '.png';
      } else if (image.includes('image/jpeg') || image.includes('image/jpg')) {
        ext = '.jpg';
      } else if (image.includes('image/gif')) {
        ext = '.gif';
      } else if (image.includes('image/webp')) {
        ext = '.webp';
      } else {
        ext = '.png';
      }
    }
    
    const finalFilename = cleanFilename.replace(/\.[^.]+$/, '') + ext;
    const filePath = path.join(assetFolderPath, finalFilename);
    
    // 解码 base64 图片数据
    let base64Data = image;
    if (image.includes(',')) {
      base64Data = image.split(',')[1];
    }
    
    // 写入文件
    await fs.writeFile(filePath, Buffer.from(base64Data, 'base64'));
    
    // 生成 Markdown 引用格式（用于 Hexo 博客）
    const markdownRef = `![](/${postName}/${finalFilename})`;

    // 管理后台预览路径
    const previewPath = `/posts-assets/${postName}/${finalFilename}`;

    res.json({
      success: true,
      filename: finalFilename,
      path: previewPath,
      markdown: markdownRef,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/upload/:postName - 获取文章的所有图片
 */
router.get('/:postName', async (req, res) => {
  try {
    const { postName } = req.params;
    
    // 验证 postName 安全性
    if (postName.includes('..') || postName.includes('/') || postName.includes('\\')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid post name' 
      });
    }
    
    const assetFolderPath = path.join(POSTS_DIR, postName);
    
    try {
      await fs.access(assetFolderPath);
    } catch {
      return res.json({ success: true, images: [] });
    }
    
    const files = await fs.readdir(assetFolderPath);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const images = files
      .filter(f => imageExtensions.includes(path.extname(f).toLowerCase()))
      .map(f => ({
        filename: f,
        path: `/posts-assets/${postName}/${f}`,
        markdown: `![](/${postName}/${f})`
      }));
    
    res.json({ success: true, images });
  } catch (error) {
    console.error('Error listing images:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/upload/:postName/:filename - 删除图片
 */
router.delete('/:postName/:filename', async (req, res) => {
  try {
    const { postName, filename } = req.params;
    
    // 验证安全性
    if (postName.includes('..') || filename.includes('..')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid path' 
      });
    }
    
    const filePath = path.join(POSTS_DIR, postName, filename);
    
    // 安全检查
    if (!filePath.startsWith(POSTS_DIR)) {
      return res.status(403).json({ success: false, error: 'Invalid file path' });
    }
    
    await fs.unlink(filePath);
    
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
