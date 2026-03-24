/**
 * 部署路由 - 一键部署到 GitHub Pages
 */

const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const { ROOT_DIR } = require('../server');

// 存储正在进行的部署进程
const activeDeployments = new Map();

/**
 * POST /api/deploy - 执行一键部署
 */
router.post('/', (req, res) => {
  const deploymentId = Date.now().toString();
  
  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const sendLog = (message, type = 'info') => {
    res.write(`data: ${JSON.stringify({ type, message, timestamp: new Date().toISOString() })}\n\n`);
  };
  
  sendLog('🚀 开始部署流程...', 'start');
  
  // 步骤1: 检查 git 状态
  sendLog('📋 步骤 1/4: 检查 Git 状态...');
  
  const gitStatus = spawn('git', ['status', '--short'], {
    cwd: ROOT_DIR,
    shell: true
  });
  
  let hasChanges = false;
  
  gitStatus.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      hasChanges = true;
      sendLog(`检测到变更:\n${output}`);
    }
  });
  
  gitStatus.on('close', (code) => {
    if (code !== 0) {
      sendLog('❌ Git 状态检查失败', 'error');
      res.end();
      return;
    }
    
    if (!hasChanges) {
      sendLog('ℹ️ 没有检测到变更，跳过提交步骤');
      // 继续执行推送（以防之前有未推送的提交）
      doPush();
    } else {
      doAddAndCommit();
    }
  });
  
  // 步骤2: 添加文件
  function doAddAndCommit() {
    sendLog('📦 步骤 2/4: 添加文件到暂存区...');
    
    const gitAdd = spawn('git', ['add', '.'], {
      cwd: ROOT_DIR,
      shell: true
    });
    
    gitAdd.on('close', (code) => {
      if (code !== 0) {
        sendLog('❌ Git add 失败', 'error');
        res.end();
        return;
      }
      
      sendLog('✅ 文件已添加');
      doCommit();
    });
  }
  
  // 步骤3: 提交
  function doCommit() {
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    
    sendLog('💾 步骤 3/4: 提交变更...');
    
    const gitCommit = spawn('git', ['commit', '-m', `deploy: ${timestamp}`], {
      cwd: ROOT_DIR,
      shell: true
    });
    
    gitCommit.stdout.on('data', (data) => {
      sendLog(data.toString().trim());
    });
    
    gitCommit.stderr.on('data', (data) => {
      sendLog(data.toString().trim());
    });
    
    gitCommit.on('close', (code) => {
      if (code !== 0) {
        sendLog('❌ Git commit 失败', 'error');
        res.end();
        return;
      }
      
      sendLog('✅ 提交成功');
      doPush();
    });
  }
  
  // 步骤4: 推送到远程
  function doPush() {
    sendLog('📤 步骤 4/4: 推送到 GitHub...');
    
    const gitPush = spawn('git', ['push', 'origin', 'main'], {
      cwd: ROOT_DIR,
      shell: true
    });
    
    gitPush.stdout.on('data', (data) => {
      sendLog(data.toString().trim());
    });
    
    gitPush.stderr.on('data', (data) => {
      sendLog(data.toString().trim());
    });
    
    gitPush.on('close', (code) => {
      if (code !== 0) {
        sendLog('❌ 推送失败', 'error');
        res.end();
        return;
      }
      
      sendLog('✅ 推送成功！', 'success');
      sendLog('🌐 GitHub Actions 正在构建中...', 'success');
      sendLog('🔗 访问地址: https://yunqi-meng.github.io', 'success');
      sendLog('📊 查看构建状态: https://github.com/yunqi-meng/yunqi-meng.github.io/actions', 'link');
      res.end();
    });
  }
  
  // 清理
  req.on('close', () => {
    activeDeployments.delete(deploymentId);
  });
});

/**
 * GET /api/deploy/status - 获取部署状态
 */
router.get('/status', (req, res) => {
  res.json({
    active: activeDeployments.size > 0,
    deployments: Array.from(activeDeployments.keys())
  });
});

module.exports = router;
