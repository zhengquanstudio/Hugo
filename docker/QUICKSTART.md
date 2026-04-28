# Docker 快速启动指南

## ✅ 已完成的配置

已将 `bin/linux/` 下的所有 Go 工具打包到 Docker 镜像的 `/usr/bin/` 目录。

### 📦 安装的工具（9个）

| 工具 | 镜像路径 |
|------|----------|
| config-server | /usr/bin/config-server |
| content-watcher | /usr/bin/content-watcher |
| doc-analysis | /usr/bin/doc-analysis |
| frontmatter-fixer | /usr/bin/frontmatter-fixer |
| index-generator | /usr/bin/index-generator |
| permalink-gen | /usr/bin/permalink-gen |
| remove-coverimg | /usr/bin/remove-coverimg |
| sidebar-order | /usr/bin/sidebar-order |
| vp-syntax-converter | /usr/bin/vp-syntax-converter |

## 🚀 3步快速开始

### 1️⃣ 检查前置条件
```bash
cd /home/xuguoqun/code/private/hugo-teek-theme
./docker/build.sh check
```

### 2️⃣ 构建镜像
```bash
# 使用完整版 Dockerfile（推荐）
./docker/build.sh build

# 或使用简化版 Dockerfile
./docker/build.sh build-simple
```

### 3️⃣ 启动服务
```bash
# 启动开发服务器
./docker/build.sh dev

# 访问
# 网站: http://localhost:8080
# 配置中心: http://localhost:3001
```

## 📝 常用命令速查

```bash
# 查看日志
./docker/build.sh logs

# 进入容器
./docker/build.sh shell

# 测试工具
./docker/build.sh test

# 停止服务
./docker/build.sh stop

# 构建生产版本
./docker/build.sh prod

# 查看帮助
./docker/build.sh help
```

## 🔍 验证工具安装

构建完成后，运行测试命令验证所有工具是否正确安装：

```bash
./docker/build.sh test
```

预期输出：
```
==================================================
测试镜像中的工具
==================================================
[INFO] 测试 Hugo...
hugo v0.150.0+extended

[INFO] 测试 Pagefind...
pagefind 1.x.x

[INFO] 测试 Go 工具...
  - config-server: ✅
  - content-watcher: ✅
  - doc-analysis: ✅
  - frontmatter-fixer: ✅
  - index-generator: ✅
  - permalink-gen: ✅
  - remove-coverimg: ✅
  - sidebar-order: ✅
  - vp-syntax-converter: ✅
```

## 📂 文件结构

```
docker/
├── Dockerfile              # 完整版（逐个复制工具）✅
├── Dockerfile.simple       # 简化版（通配符复制）✅
├── build.sh               # 构建脚本 ✅
├── .dockerignore          # 忽略文件
├── README.md              # 详细文档 ✅
└── QUICKSTART.md          # 本文件 ✅
```

## 🎯 两种 Dockerfile 的区别

### Dockerfile（完整版）
```dockerfile
# 逐个指定文件
COPY bin/linux/config-server /usr/bin/config-server
COPY bin/linux/content-watcher /usr/bin/content-watcher
...
```
**优点**: 明确、可控、生产环境推荐
**缺点**: 添加新工具需修改 Dockerfile

### Dockerfile.simple（简化版）
```dockerfile
# 通配符复制
COPY bin/linux/ /usr/bin/
RUN rm -f /usr/bin/README.md
```
**优点**: 简洁、自动包含新工具
**缺点**: 需要清理非可执行文件

## 💡 提示

1. **首次构建**: 需要先运行 `make install-deps` 确保 `bin/linux/` 目录存在
2. **开发模式**: 挂载了本地目录，修改内容会自动热更新
3. **生产模式**: 执行完整构建流程，生成优化后的静态文件
4. **权限问题**: 所有工具已自动设置可执行权限

## ⚠️ 注意事项

- 确保 Docker 已启动
- 确保有足够的磁盘空间（镜像约 480MB）
- 首次构建会较慢（需下载基础镜像）
- 端口 8080 和 3001 未被占用

## 🆘 遇到问题？

1. 查看详细文档: `cat docker/README.md`
2. 查看脚本帮助: `./docker/build.sh help`
3. 查看容器日志: `./docker/build.sh logs`
4. 进入容器调试: `./docker/build.sh shell`

---

**完成日期**: 2025-11-20
**项目路径**: `/home/xuguoqun/code/private/hugo-teek-theme`
