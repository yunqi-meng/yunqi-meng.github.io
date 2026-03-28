/**
 * 部署路由 - 一键部署到 GitHub Pages
 */

const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const { ROOT_DIR } = require('../paths');
const util = require('util');
const execPromise = util.promisify(exec);

// 存储正在进行的部署进程
const activeDeployments = new Map();

/**
 * GET /api/deploy - 执行一键部署（SSE 流式输出）
 */
router.get('/', async (req, res) => {
  const deploymentId = Date.now().toString();
  activeDeployments.set(deploymentId, { status: 'running', logs: [] });

  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const sendLog = (message, type = 'info', step = null) => {
    const logData = { 
      type, 
      message, 
      timestamp: new Date().toISOString(),
      step
    };
    res.write(`data: ${JSON.stringify(logData)}\n\n`);
    
    // 同时存储日志到内存中
    if (activeDeployments.has(deploymentId)) {
      activeDeployments.get(deploymentId).logs.push(logData);
    }
  };

  const runCommand = async (command, description) => {
    sendLog(`⚙️ ${description}...`, 'command');
    try {
      const { stdout, stderr } = await execPromise(command, { cwd: ROOT_DIR });
      if (stdout && stdout.trim()) {
        sendLog(stdout.trim(), 'output');
      }
      if (stderr && stderr.trim() && !stderr.includes('warning')) {
        sendLog(stderr.trim(), 'warning');
      }
      return { success: true, stdout, stderr };
    } catch (error) {
      sendLog(`❌ ${description}失败：${error.message}`, 'error');
      throw error;
    }
  };

  sendLog('🚀 开始部署流程...', 'start', 0);

  try {
    // 步骤 1: 检查远程变更
    sendLog('📋 步骤 1/5: 检查远程变更...', 'step', 1);
    try {
      await runCommand('git fetch origin main', '从远程获取最新变更');
      
      // 检查本地是否落后于远程
      try {
        const { stdout: revListOutput } = await execPromise('git rev-list --left-right --count HEAD...origin/main', { cwd: ROOT_DIR });
        const [ahead, behind] = revListOutput.trim().split('\t').map(Number);
        
        if (behind > 0) {
          sendLog(`⚠️  您的分支落后 origin/main ${behind} 个提交`, 'warning', 1);
          sendLog('💡 建议先拉取最新变更：git pull origin main', 'info', 1);
        } else if (ahead > 0) {
          sendLog(`✅ 本地领先 origin/main ${ahead} 个提交`, 'success', 1);
        } else {
          sendLog('✅ 本地与远程同步', 'success', 1);
        }
      } catch (err) {
        sendLog('⚠️  无法比较远程分支，可能不存在', 'warning', 1);
      }
    } catch (err) {
      sendLog('⚠️  无法访问远程仓库，请检查网络连接', 'warning', 1);
    }

    // 步骤 2: 检查本地 git 状态
    sendLog('📋 步骤 2/5: 检查本地变更...', 'step', 2);
    const { stdout: statusOutput } = await runCommand('git status --short', '检查文件变更状态');
    const hasChanges = statusOutput.trim().length > 0;

    if (hasChanges) {
      sendLog(`📝 检测到以下变更:\n${statusOutput.trim()}`, 'info', 2);
    } else {
      sendLog('ℹ️ 工作区干净，没有未提交的变更', 'info', 2);
    }

    // 步骤 3: 添加文件
    if (hasChanges) {
      sendLog('📋 步骤 3/5: 添加所有变更到暂存区...', 'step', 3);
      await runCommand('git add .', '添加文件到暂存区');
      sendLog('✅ 所有文件已添加到暂存区', 'success', 3);

      // 步骤 4: 提交变更
      sendLog('📋 步骤 4/5: 提交变更...', 'step', 4);
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      const commitMessage = `deploy: ${timestamp}`;

      try {
        const { stdout } = await runCommand(`git commit -m "${commitMessage}"`, '提交变更');
        if (stdout && stdout.includes('created')) {
          sendLog('✅ 提交成功', 'success', 4);
        } else {
          sendLog('ℹ️ 没有需要提交的变更', 'info', 4);
        }
      } catch (commitErr) {
        if (commitErr.message.includes('nothing to commit')) {
          sendLog('ℹ️ 没有需要提交的变更', 'info', 4);
        } else {
          throw commitErr;
        }
      }
    } else {
      sendLog('⏭️  跳过提交步骤', 'info', 4);
    }

    // 步骤 5: 推送到远程
    sendLog('📋 步骤 5/5: 推送到 GitHub...', 'step', 5);
    const pushResult = await runCommand('git push origin main', '推送代码到远程仓库');
    
    if (pushResult.success) {
      sendLog('✅ 推送成功！', 'success', 5);
      sendLog('🌐 GitHub Actions 正在构建中...', 'success', 5);
      sendLog('🔗 访问地址：https://yunqi-meng.github.io', 'link', 5);
      sendLog('📊 查看构建状态：https://github.com/yunqi-meng/yunqi-meng.github.io/actions', 'link', 5);
    }

    // 更新部署状态
    if (activeDeployments.has(deploymentId)) {
      activeDeployments.get(deploymentId).status = 'completed';
    }
    sendLog('🎉 部署完成！', 'end');

  } catch (error) {
    sendLog(`❌ 部署失败：${error.message}`, 'error');
    if (activeDeployments.has(deploymentId)) {
      activeDeployments.get(deploymentId).status = 'failed';
    }
  } finally {
    // 保持连接一段时间再关闭
    setTimeout(() => {
      res.end();
      // 清理已完成的部署记录
      activeDeployments.delete(deploymentId);
    }, 1000);
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
