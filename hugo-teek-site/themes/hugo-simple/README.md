# Hugo Simple Theme

一个简约优雅的 Hugo 博客主题，采用纯黑背景和卡片式布局设计。

## 特性

- 🌙 **纯黑主题** - 整体采用纯黑背景 (#000000)，护眼舒适
- 🎨 **卡片式布局** - 文章以卡片形式展示，悬浮放大效果
- 📱 **完全响应式** - 适配手机、平板、桌面等各种设备
- 🔍 **搜索支持** - 顶部集成搜索框
- 📂 **下拉菜单** - 分类采用下拉菜单设计
- 🖼️ **Hero 背景图** - 支持自定义 Hero 区域背景图片
- 👤 **头像显示** - 右上角显示微信头像或个人头像
- 📄 **每页 10 篇** - 默认每页显示 10 篇文章
- 🎯 **无侧边栏** - 专注内容展示的单栏布局

## 性能与安全

- ⚡ **图片懒加载** - 使用 Intersection Observer API，首屏仅加载 3 张图片
- 🔒 **CSP 安全策略** - Content Security Policy 防止 XSS 攻击
- 🚀 **资源优化** - DNS 预解析、CDN 预连接、关键资源预加载
- ♿ **无障碍访问** - 链接添加下划线，不仅依赖颜色区分
- 📊 **Lighthouse 优化** - 针对性能、可访问性、最佳实践进行优化

## 使用方法

### 1. 切换主题

编辑 `hugo-teek-site/hugo.toml`：

```toml
theme = "hugo-simple"
```

### 2. 配置主题

主题配置位于 `config/themes/hugo-simple/`：

- `params.toml` - 参数配置（Hero 背景、头像、分类等）
- `menus.toml` - 菜单配置

### 3. 启动开发服务器

```bash
make dev
```

或手动启动：

```bash
hugo server --buildDrafts
```

## 配置说明

### 安全配置（推荐）

为了获得完整的安全保护，建议配置 HTTP 响应头：

```bash
# 1. 复制配置模板
cp themes/hugo-simple/static/_headers.example static/_headers

# 2. 根据你的 CDN 修改 img-src 指令
# 3. 重新构建站点
make build
```

详细说明请参考：[SECURITY.md](./SECURITY.md)

**支持的托管平台**:
- ✅ Netlify
- ✅ Cloudflare Pages
- ✅ Vercel
- ✅ Nginx
- ✅ Apache
- ❌ GitHub Pages（需要 Cloudflare CDN 代理）

### Hero 区域配置

```toml
[params]
  heroTitle = "blog.srehro.cn | 旗麟小栈"
  heroSubtitle = "Welcome To Here. Peace, Love."
  heroBgImage = "https://img.xxdevops.cn/blog/wallpaper/sunset.avif"
```

### 头像配置

```toml
[params]
  avatarImage = "https://img.xxdevops.cn/blog/avatar/wechat.jpg"
  avatarLink = "/about/"  # 点击头像跳转的链接
```

### 分类下拉菜单配置

```toml
[[params.categories]]
  name = "编码"
  url = "/categories/编码/"

[[params.categories]]
  name = "旅行"
  url = "/categories/旅行/"

[[params.categories]]
  name = "杂谈"
  url = "/categories/杂谈/"
```

### 菜单配置

```toml
[[main]]
  name = "好友"
  url = "/friends/"
  weight = 3

[[main]]
  name = "关于"
  url = "/about/"
  weight = 4

[[main]]
  name = "归档"
  url = "/archives/"
  weight = 5
```

## 文章 Front Matter

```yaml
---
title: "文章标题"
date: 2025-11-25
categories: ["编码"]
tags: ["Hugo", "Web"]
coverImg: "https://img.xxdevops.cn/blog/covers/article-1.jpg"
description: "文章描述"
---
```

**重要字段：**
- `coverImg` - 文章封面图，将作为卡片背景显示
- `categories` - 分类，显示在卡片元信息中
- `date` - 发布日期

## 页面布局

```
┌─────────────────────────────────────┐
│  [导航栏]                            │
│  博客名 分类▼ 好友 关于 归档        │
│  搜索框 [头像]                       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  [Hero 区域 - 背景图]                │
│  blog.srehro.cn | 旗麟小栈          │
│  Welcome To Here. Peace, Love.      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  [文章卡片 1]                        │
│  coverImg 背景                       │
│  标题                                │
│  admin · 2025-11-25 · 编码          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  [文章卡片 2]                        │
│  ...                                │
└─────────────────────────────────────┘

...（共 10 张卡片）

                               [下一页 →]
```

## 主题特点

### 视觉设计
- 纯黑背景 (#000000)
- 卡片背景 (#0f0f0f)
- 白色/浅灰色文字
- 蓝色链接 (#64b5f6)

### 交互效果
- 卡片悬浮放大 10%
- 搜索框聚焦时宽度扩展
- 头像悬浮时放大
- 平滑过渡动画

### 响应式设计
- 桌面：最大宽度 1200px
- 平板：自适应布局
- 手机：单栏垂直布局，卡片放大效果减半

## 开发

主题文件结构：

```
hugo-simple/
├── layouts/
│   ├── _default/
│   │   ├── baseof.html
│   │   └── single.html
│   ├── partials/
│   │   ├── header.html
│   │   ├── hero.html
│   │   └── footer.html
│   └── index.html
├── assets/
│   └── css/
│       └── style.css
└── theme.toml
```

## 浏览器警告说明

如果在 Chrome DevTools 中看到警告，请阅读 [BROWSER_WARNINGS.md](./BROWSER_WARNINGS.md)。

**常见警告**：
- ❌ WebSocket DevTools / Vue Devtools 警告 → 来自浏览器扩展，不是主题代码
- ✅ Content Security Policy → 已修复
- ✅ 链接可访问性 → 已优化

**快速排查**：在无痕模式下打开网站（禁用所有扩展），检查是否还有警告。

## 性能指标

优化后的性能表现：

- **首屏加载**: 仅加载 3 张图片，其他按需懒加载
- **网络请求**: DNS 预解析 + CDN 预连接减少延迟
- **JavaScript**: IIFE 封装，严格模式，完善错误处理
- **安全性**: CSP、Referrer Policy、X-UA-Compatible

## 许可证

MIT License
