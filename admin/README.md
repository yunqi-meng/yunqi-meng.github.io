# 博客后台管理系统使用说明

本地 Hexo 博客的可视化管理界面，用于编辑文章、独立页面、上传图片、修改站点配置，以及一键 Git 推送部署。

---

## 一、启动方式

### 1. 命令行（推荐）

在**项目根目录**（与 `package.json` 同级）执行：

```bash
npm install
npm run admin
```

浏览器访问：**http://localhost:4007**

### 2. Windows 一键启动（推荐）

双击项目根目录下的 **`start-admin.bat`**，将依次执行：

1. **`npm install`**（同步依赖；已安装且无变更时很快结束）  
2. **启动后台**（`node admin/server.js`）  
3. **约 2 秒后自动打开浏览器**（默认 **http://localhost:4007**，与 `admin/server.js` 里 `PORT` 一致）

---

## 二、环境要求

- **Node.js** 已安装并加入 PATH（建议 ≥ 18）
- 已在项目根目录执行过 **`npm install`**（需要 `express` 等依赖）
- 默认监听 **127.0.0.1:4007**。若端口被占用，请关闭占用该端口的程序，或修改 **`admin/server.js`** 中的 `PORT` 后重启

---

## 三、界面功能说明

### 1. 文章管理

| 操作 | 说明 |
|------|------|
| **新建文章** | 输入标题后创建 Markdown 文件到 `source/_posts/`，并创建同名资源文件夹（用于文章内图片） |
| **编辑** | 修改标题与正文（Markdown），保存写回对应 `.md` 文件 |
| **发布 / 转为草稿** | 通过 Front Matter 中的 `published` 字段控制是否在站点中视为已发布（与 Hexo 生成逻辑配合） |
| **删除** | 删除文章文件及同名资源文件夹（不可恢复，请谨慎） |
| **插入图片**（编辑器内） | 选择图片后上传到**当前文章**对应的资源目录，并在正文末尾插入 Hexo 资源标签（如 `{% asset_img xxx.png %}`） |

草稿与已发布状态会在列表中以标签区分。

### 2. 独立页面

列出 **`source` 根目录**下、非 `_` 开头的 `.md` 文件（如关于页等），可编辑保存。  
**注意**：子目录内的页面不会出现在此列表中。

编辑独立页面时，**插入图片**会上传到 **`source/images`**，并在正文插入 Markdown 图片语法 `![](/images/...)`

### 3. 站点配置

- **编辑 _config.yml**：Hexo 主配置  
- **编辑主题配置**：`_config.butterfly.yml`（Butterfly 主题）

保存前服务端会尝试生成带时间戳的备份文件（`.backup.时间戳`）。请谨慎修改 YAML 语法，错误可能导致生成失败。

### 4. 部署网站

点击 **「部署网站」** 后，会在**你的本机仓库**执行：

1. `git add .`  
2. `git commit`（无变更时会跳过提交）  
3. `git push origin main`

**前提**：本机已配置 Git 用户、远程仓库 `origin`、且对 `main` 分支有推送权限。失败时请根据控制台或页面提示检查网络与仓库设置。

---

## 四、与 Hexo 的关系

- 后台直接读写 **`source/_posts/*.md`**、**`source/*.md`** 及配置文件，与 Hexo 源文件一致。  
- 本地预览站点请另开终端执行：`npx hexo server` 或 `npm run server`。  
- 生成静态站：`npm run build`（`hexo generate`）。

---

## 五、常用 API 前缀（供调试）

| 前缀 | 用途 |
|------|------|
| `/api/admin` | 管理页使用的兼容接口（文章列表、新建、保存、发布、页面、图片上传到 images、部署等） |
| `/api/posts` | REST 风格文章接口（GET/POST/PUT/DELETE） |
| `/api/upload/:文章资源目录名` | 上传到 `source/_posts/该目录/` |
| `/api/config` | 读取/更新站点与主题配置 |
| `/api/deploy` | 流式日志的一键部署（与页面按钮使用的 `/api/admin/deploy` 行为类似，响应格式不同） |
| `/api/health` | 健康检查 |

管理页使用当前访问的 **同源** 地址拼接上述路径，一般无需改端口常量。

---

## 六、常见问题

**1. 打不开页面或接口报错**  
确认后台进程已启动、防火墙未拦截本机 4007，且浏览器地址为 `http://localhost:4007`（与 `PORT` 一致）。

**2. 提示端口被占用**  
关闭已运行的后台窗口，或修改 `admin/server.js` 中的 `PORT`。

**3. 中文标题新建文章文件名异常**  
当前逻辑会尽量生成合法文件名；若遇异常，可检查 `admin/utils/helpers.js` 中的 `generateFileName`。

**4. 图片在站点中不显示**  
确认 Hexo 文章资源目录配置与标签用法与主题一致；独立页面图片路径以 `/images/` 为准。

---

更多实现细节见 `admin/server.js` 与各 `admin/routes/*.js` 文件。
