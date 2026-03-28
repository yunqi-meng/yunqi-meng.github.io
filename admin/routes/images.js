/**
 * 图片资源管理路由
 */

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { POSTS_DIR } = require('../paths');

/**
 * GET /api/images - 获取所有图片资源
 */
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    const files = await fs.readdir(POSTS_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    let allImages = [];
    
    for (const fileName of mdFiles) {
      const postName = fileName.replace('.md', '');
      const assetFolderPath = path.join(POSTS_DIR, postName);
      
      try {
        await fs.access(assetFolderPath);
        const imageFiles = await fs.readdir(assetFolderPath);
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        
        const images = imageFiles
          .filter(f => imageExtensions.includes(path.extname(f).toLowerCase()))
          .map(f => ({
            filename: f,
            path: `/posts-assets/${postName}/${f}`,
            markdown: `{% asset_img ${f} %}`,
            postName,
            postFile: fileName
          }));
        
        allImages = allImages.concat(images);
      } catch {
        continue;
      }
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      allImages = allImages.filter(img => 
        img.filename.toLowerCase().includes(searchLower) ||
        img.postName.toLowerCase().includes(searchLower)
      );
    }
    
    if (category) {
      allImages = allImages.filter(img => img.postName === category);
    }
    
    const categories = [...new Set(allImages.map(img => img.postName))];
    
    res.json({ 
      success: true, 
      images: allImages,
      categories,
      total: allImages.length
    });
  } catch (error) {
    console.error('Error listing images:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/images/:postName/:filename - 删除图片
 */
router.delete('/:postName/:filename', async (req, res) => {
  try {
    const { postName, filename } = req.params;
    
    if (postName.includes('..') || filename.includes('..')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid path' 
      });
    }
    
    const filePath = path.join(POSTS_DIR, postName, filename);
    
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