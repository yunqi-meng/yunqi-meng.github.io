/**
 * 部署路由 - 一键部署到 GitHub Pages
 */

const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const { ROOT_DIR } = require('../server');
const util = require('util');
const execPromise = util.promisify(exec);

// 存储正在进行的部署进程
const activeDeployments = new Map();

/**
 * POST /api/deploy - 执行一键部署
 */
router.post('/', async (req, res) => {
  const deploymentId = Date.now().toString();

  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendLog = (message, type = 'info') => {
    res.write(`data: ${JSON.stringify({ type, message, timestamp: new Date().toISOString() })}\n\n`);
  };

  sendLog('🚀 开始部署流程...', 'start');

  try {
    // 步骤1: 检查 git 状态
    sendLog('📋 步骤 1/4: 检查 Git 状态...');

    const { stdout: statusOutput } = await execPromise('git status --short', { cwd: ROOT_DIR });
    const hasChanges = statusOutput.trim().length > 0;

    if (hasChanges) {
      sendLog(`检测到变更:\n${statusOutput.trim()}`);
    } else {
      sendLog('ℹ️ 没有检测到变更，跳过提交步骤');
    }

    if (hasChanges) {
      // 步骤2: 添加文件
      sendLog('📦 步骤 2/4: 添加文件到暂存区...');
      await execPromise('git add .', { cwd: ROOT_DIR });
      sendLog('✅ 文件已添加');

      // 步骤3: 提交
      sendLog('💾 步骤 3/4: 提交变更...');
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

      try {
        const { stdout, stderr } = await execPromise(`git commit -m "deploy: ${timestamp}"`, { cwd: ROOT_DIR });
        if (stdout.trim()) sendLog(stdout.trim());
        if (stderr.trim() && !stderr.includes('warning')) sendLog(stderr.trim());
        sendLog('✅ 提交成功');
      } catch (commitErr) {
        // 检查是否是 "nothing to commit" 的情况
        if (commitErr.message.includes('nothing to commit')) {
          sendLog('ℹ️ 没有需要提交的变更');
        } else {
          throw commitErr;
        }
      }
    }

    // 步骤4: 推送到远程
    sendLog('📤 步骤 4/4: 推送到 GitHub...');
    const { stdout: pushStdout, stderr: pushStderr } = await execPromise('git push origin main', { cwd: ROOT_DIR });
    if (pushStdout.trim()) sendLog(pushStdout.trim());
    if (pushStderr.trim()) sendLog(pushStderr.trim());

    sendLog('✅ 推送成功！', 'success');
    sendLog('🌐 GitHub Actions 正在构建中...', 'success');
    sendLog('🔗 访问地址: https://yunqi-meng.github.io', 'success');
    sendLog('📊 查看构建状态: https://github.com/yunqi-meng/yunqi-meng.github.io/actions', 'link');

  } catch (error) {
    sendLog(`❌ 错误: ${error.message}`, 'error');
  } finally {
    res.end();
  }
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
