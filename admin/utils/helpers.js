/**
 * 工具函数
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * 解析 Markdown 文件的 Front Matter
 */
function parseFrontMatter(content) {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontMatterRegex);
  
  if (!match) {
    return { frontMatter: {}, body: content };
  }
  
  const frontMatterText = match[1];
  const body = match[2];
  
  // 简单解析 YAML
  const frontMatter = {};
  frontMatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      
      // 移除引号
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // 解析数组
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      }
      
      // 解析布尔值
      if (value === 'true') value = true;
      if (value === 'false') value = false;
      
      frontMatter[key] = value;
    }
  });
  
  return { frontMatter, body };
}

/**
 * 生成 Front Matter
 */
function generateFrontMatter(frontMatter) {
  const lines = ['---'];
  
  for (const [key, value] of Object.entries(frontMatter)) {
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      value.forEach(v => lines.push(`  - ${v}`));
    } else if (typeof value === 'boolean') {
      lines.push(`${key}: ${value}`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  
  lines.push('---', '');
  return lines.join('\n');
}

/**
 * 生成文件名（从标题）
 * 中文等非 ASCII 标题保留为文件名的一部分，避免生成 2026-01-01-.md
 */
function generateFileName(title) {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const asciiSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);

  if (asciiSlug) {
    return `${dateStr}-${asciiSlug}.md`;
  }

  let safe = title
    .replace(/[\\/:*?"<>|\r\n\t]+/g, '')
    .trim()
    .substring(0, 60);
  if (!safe) {
    safe = `post-${Date.now()}`;
  }
  return `${dateStr}-${safe}.md`;
}

/** 判断 resolved 后的路径是否在目录内（兼容 Windows 路径） */
function isPathInside(filePath, dir) {
  const resolved = path.resolve(filePath);
  const resolvedDir = path.resolve(dir);
  const rel = path.relative(resolvedDir, resolved);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

/**
 * 获取文件信息
 */
async function getFileInfo(filePath) {
  const stats = await fs.stat(filePath);
  const content = await fs.readFile(filePath, 'utf-8');
  const { frontMatter, body } = parseFrontMatter(content);
  
  return {
    title: frontMatter.title || path.basename(filePath, '.md'),
    date: frontMatter.date || stats.birthtime.toISOString(),
    updated: stats.mtime.toISOString(),
    categories: frontMatter.categories || [],
    tags: frontMatter.tags || [],
    published: frontMatter.published !== false,
    frontMatter,
    body,
    fileName: path.basename(filePath),
    filePath
  };
}

/**
 * 确保目录存在
 */
async function ensureDir(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

module.exports = {
  parseFrontMatter,
  generateFrontMatter,
  generateFileName,
  getFileInfo,
  ensureDir,
  isPathInside
};
