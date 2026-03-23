# 现代化极简博客升级说明

## 🎨 设计理念

本博客采用现代化极简高级风格，参考了张洪Heo、Notion风格等优秀设计，实现干净通透、大留白、低饱和度、柔和优雅的视觉效果。

## ✨ 主要特性

### 1. 视觉设计
- **极简高级风格**: 干净通透，大留白设计
- **柔和配色**: 主色调 #5e60ce (优雅紫色) + 中性灰 + 白色
- **统一圆角**: 所有元素采用一致的圆角系统
- **柔和阴影**: 多层次的阴影效果，增强层次感
- **克制动画**: 所有动画速度统一，不夸张、不廉价

### 2. 响应式布局
- **完美适配**: PC / 平板 / 手机 全部适配
- **移动端优化**: 汉堡菜单、单列布局
- **自适应设计**: 字体、图片、卡片自动适配宽度

### 3. 交互功能
- **深色/浅色模式**: 平滑切换，记忆状态
- **阅读进度条**: 顶部显示阅读进度
- **文章目录 (TOC)**: 固定侧边，滚动高亮
- **本地搜索**: 弹出式搜索框，快捷键 Ctrl+K
- **图片灯箱**: 点击图片放大查看
- **图片懒加载**: 性能优化
- **回到顶部**: 简约悬浮按钮

### 4. 页面结构
- **顶部导航栏**: 固定、滚动时变化、毛玻璃效果
- **首页**: 卡片流式布局、悬浮动效
- **文章详情页**: 居中宽阅读区、舒适排版
- **分类页**: 大卡片展示
- **标签页**: 胶囊样式
- **归档页**: 时间轴样式
- **关于页**: 卡片式布局

## 📁 文件结构

```
gerenboke/
├── source/
│   ├── css/
│   │   ├── modern.css          # 现代化样式文件
│   │   └── custom.css          # 自定义样式（保留）
│   ├── js/
│   │   ├── modern.js           # 现代化交互脚本
│   │   └── main.js             # 原有脚本（保留）
│   ├── layout/                 # 自定义布局模板
│   │   ├── index.pug           # 首页
│   │   ├── post.pug            # 文章页
│   │   ├── archive.pug         # 归档页
│   │   ├── category.pug        # 分类页
│   │   ├── tag.pug             # 标签页
│   │   └── page.pug            # 通用页
│   └── images/                 # 图片资源
├── _config.yml                 # Hexo 主配置
└── _config.butterfly.yml       # Butterfly 主题配置
```

## 🚀 使用方法

### 安装依赖

```bash
npm install
```

### 启动本地服务器

```bash
npm run server
```

### 构建静态文件

```bash
npm run build
```

### 清理缓存

```bash
npm run clean
```

## ⚙️ 配置说明

### 主题配置 (_config.butterfly.yml)

主要配置项：

```yaml
# 导航栏
nav:
  fixed: true
  menu:
    首页: / || fas fa-home
    归档: /archives/ || fas fa-archive
    标签: /tags/ || fas fa-tags
    分类: /categories/ || fas fa-folder-open
    关于: /about/ || fas fa-user

# 深色模式
darkmode:
  enable: true
  button: true
  autoChangeMode: 1  # 0=关闭, 1=自动, 2=强制

# 侧边栏
aside:
  enable: true
  position: right
  card_author:
    enable: true
    description: 热爱技术，专注开发
  card_recent_post:
    enable: true
    limit: 5
  card_categories:
    enable: true
  card_tags:
    enable: true
  card_archives:
    enable: true

# 本地搜索
local_search:
  enable: true

# 图片懒加载
image_lazyload:
  enable: true
  field: site
```

### 自定义样式

如需自定义样式，可以修改 `source/css/modern.css` 或在 `source/css/custom.css` 中添加：

```css
/* 修改主色调 */
:root {
  --primary: #your-color;
}

/* 自定义样式 */
.your-class {
  /* 你的样式 */
}
```

## 🎨 配色方案

### 浅色模式
- 主色: `#5e60ce`
- 背景: `#ffffff` / `#f8f9fc` / `#f3f4f6`
- 文字: `#1a1a1a` / `#525252` / `#a3a3a3`
- 边框: `#f0f0f0` / `#e5e5e5` / `#d4d4d4`

### 深色模式
- 背景: `#0a0a0a` / `#141414` / `#1a1a1a`
- 文字: `#f5f5f5` / `#d4d4d4` / `#737373`
- 边框: `#262626` / `#404040` / `#525252`

## 📱 响应式断点

- PC: `> 1200px`
- 平板: `768px - 1200px`
- 手机: `< 768px`

## 🔧 功能实现

### 深色模式切换
- 自动检测系统主题偏好
- 手动切换并记忆选择
- 平滑过渡动画

### 搜索功能
- 本地静态搜索
- 快捷键 `Ctrl+K` / `Cmd+K`
- 弹出式搜索框
- 实时搜索结果

### TOC 目录
- 固定在侧边栏
- 滚动时自动高亮
- 平滑滚动到锚点

### 图片灯箱
- 点击图片放大
- 支持键盘操作 (ESC 关闭)
- 背景模糊效果

### 阅读进度条
- 顶部固定显示
- 实时更新进度
- 渐变色设计

## 🎯 性能优化

- CSS 变量系统，便于主题切换
- IntersectionObserver 实现懒加载
- requestAnimationFrame 优化动画
- 按需加载交互脚本

## 📄 兼容性

- Chrome / Edge (推荐)
- Firefox
- Safari
- 移动端浏览器

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📝 License

MIT License

---

**设计参考**: 张洪Heo、Notion、掘金高品质博客
**技术栈**: Hexo + Butterfly + CSS3 + JavaScript
