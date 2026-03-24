/**
 * 配置管理路由
 */

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { ROOT_DIR } = require('../server');

const CONFIG_FILES = {
  site: path.join(ROOT_DIR, '_config.yml'),
  theme: path.join(ROOT_DIR, '_config.butterfly.yml')
};

/**
 * GET /api/config/:type - 获取配置文件内容
 */
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const filePath = CONFIG_FILES[type];
    
    if (!filePath) {
      return res.status(400).json({ success: false, error: 'Invalid config type' });
    }
    
    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ success: true, type, content });
  } catch (error) {
    console.error('Error reading config:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/config/:type - 更新配置文件
 */
router.put('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { content } = req.body;
    const filePath = CONFIG_FILES[type];
    
    if (!filePath) {
      return res.status(400).json({ success: false, error: 'Invalid config type' });
    }
    
    if (content === undefined) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }
    
    // 备份原文件
    const backupPath = `${filePath}.backup.${Date.now()}`;
    try {
      await fs.copyFile(filePath, backupPath);
    } catch (err) {
      console.warn('Failed to create backup:', err);
    }
    
    // 写入新内容
    await fs.writeFile(filePath, content, 'utf-8');
    
    res.json({ success: true, message: 'Config updated successfully' });
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/config - 获取所有配置文件的列表
 */
router.get('/', async (req, res) => {
  try {
    const configs = [];
    
    for (const [type, filePath] of Object.entries(CONFIG_FILES)) {
      try {
        const stats = await fs.stat(filePath);
        configs.push({
          type,
          path: filePath,
          size: stats.size,
          modified: stats.mtime.toISOString()
        });
      } catch {
        // 文件不存在，跳过
      }
    }
    
    res.json({ success: true, configs });
  } catch (error) {
    console.error('Error listing configs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
