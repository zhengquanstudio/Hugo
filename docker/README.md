# Docker 构建指南

本目录包含用于构建 Hugo Teek 站点的 Docker 配置文件。

## 📦 可用的 Dockerfile

### 1. `Dockerfile` - 标准构建
使用本地已编译的二进制文件构建镜像。

**适用场景**：本地开发、手动构建

**使用方法**：
```bash
# 方式一：自动化（推荐）
make docker-build  # 自动下载 hugo/pagefind 并编译工具

# 方式二：手动步骤
make install-tools   # 编译 hugo-teek-tools
make download-tools  # 下载 hugo 和 pagefind
docker build -f docker/Dockerfile -t hugo-teek-site:latest .
```

**优点**：
- ✅ 构建速度快（复用本地二进制）
- ✅ 适合快速迭代
- ✅ 自动下载必需工具（hugo, pagefind）

**缺点**：
- 依赖本地环境

---

### 2. `Dockerfile.multistage` - 多阶段构建
在 Docker 构建过程中编译 `hugo-teek-tools`，但需要提供 hugo 和 pagefind 二进制。

**适用场景**：部分自动化构建

**使用方法**：
```bash
make docker-build-multistage
# 或
docker build -f docker/Dockerfile.multistage -t hugo-teek-site:latest .
```

**优点**：
- 自动编译 Go 工具
- 最终镜像体积小

**缺点**：
- 仍需提供 hugo 和 pagefind 二进制

---

### 3. `Dockerfile.ci` - CI/CD 专用（推荐）✨
完全自包含的构建，自动下载和编译所有依赖。

**适用场景**：CI/CD 流水线、自动化部署

**使用方法**：
```bash
make docker-build-ci
# 或
docker build -f docker/Dockerfile.ci \
  --build-arg HUGO_VERSION=0.151.0 \
  --build-arg PAGEFIND_VERSION=1.0.4 \
  -t hugo-teek-site:latest \
  .
```

**优点**：
- ✅ 完全自包含，无需本地环境
- ✅ 自动下载 Hugo 和 Pagefind
- ✅ 自动编译 hugo-teek-tools
- ✅ 适合 CI/CD 流水线
- ✅ 可指定版本

**缺点**：
- 首次构建时间较长（约 2-3 分钟）
- 需要网络访问 GitHub Releases

---

## 🚀 快速开始

### 本地构建和测试

```bash
# 1. 构建镜像（CI 版本）
make docker-build-ci

# 2. 运行容器测试
make docker-run

# 3. 查看生成的站点
ls -la hugo-teek-site/public/
```

### CI/CD 流水线

#### GitHub Actions

已提供配置文件：`.github/workflows/docker-build.yml`

**设置步骤**：
1. 在 GitHub 仓库 Settings → Secrets 中添加：
   - `DOCKER_USERNAME`: Docker Hub 用户名
   - `DOCKER_PASSWORD`: Docker Hub 密码或 Token

2. 推送代码到 `master` 分支即可自动触发构建

3. 推送带 `v*` 标签可发布版本镜像：
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

#### GitLab CI

已提供配置文件：`.gitlab-ci.yml`

**设置步骤**：
1. 在 GitLab 项目 Settings → CI/CD → Variables 中添加：
   - `DOCKER_USERNAME`: Docker Hub 用户名
   - `DOCKER_PASSWORD`: Docker Hub 密码

2. 推送代码到 `master` 分支触发构建

3. 手动触发推送：在 CI/CD → Pipelines 中点击"Run Pipeline"

---

## 📋 Makefile 命令参考

| 命令 | 说明 |
|------|------|
| `make docker-build` | 使用本地二进制构建（需先 `make install-tools`） |
| `make docker-build-multistage` | 多阶段构建（自动编译 Go 工具） |
| `make docker-build-ci` | CI 专用构建（完全自包含） ✨ |
| `make docker-run` | 运行容器测试构建 |
| `make docker-push` | 推送镜像到 Docker Hub |
| `make docker-release` | 构建并推送（CI/CD 常用） |

---

## 🔧 构建参数

### Hugo 版本

默认：`0.151.0`

```bash
docker build -f docker/Dockerfile.ci \
  --build-arg HUGO_VERSION=0.150.0 \
  -t hugo-teek-site:latest .
```

### Pagefind 版本

默认：`1.0.4`

```bash
docker build -f docker/Dockerfile.ci \
  --build-arg PAGEFIND_VERSION=1.1.0 \
  -t hugo-teek-site:latest .
```

---

## 📊 镜像大小对比

| Dockerfile | 镜像大小 | 构建时间 |
|-----------|---------|---------|
| `Dockerfile` | ~450 MB | ~30s |
| `Dockerfile.multistage` | ~400 MB | ~1m 30s |
| `Dockerfile.ci` | ~380 MB | ~2m 30s |

*注：实际大小和时间取决于网络速度和缓存情况*

---

## 📦 镜像中的工具

新版镜像使用统一工具 `hugo-teek-tools`：

| 工具 | 路径 | 说明 |
|------|------|------|
| hugo | /usr/local/bin/hugo | Hugo 静态站点生成器 |
| pagefind | /usr/local/bin/pagefind | 搜索索引工具 |
| **hugo-teek-tools** | /usr/bin/hugo-teek-tools | **统一构建工具** ✨ |

`hugo-teek-tools` 包含以下子命令：
- `build` - 完整构建流程
- `clean` - 清理临时文件
- `frontmatter` - 修复 Front Matter
- `permalink` - 生成 permalink
- `sidebar` - 生成侧边栏排序
- `index` - 生成索引页
- `convert` - VitePress 语法转换
- `analysis` - 文档分析

---

## 🐛 故障排查

### 构建失败：hugo-teek-tools 找不到

**原因**：使用 `Dockerfile` 但未编译工具

**解决**：
```bash
make install-tools
make docker-build
```

或改用 `Dockerfile.ci`：
```bash
make docker-build-ci
```

### 下载 Hugo/Pagefind 失败

**原因**：网络访问 GitHub Releases 受限

**解决方案 1** - 使用镜像：
```dockerfile
# 修改 Dockerfile.ci 中的下载地址
RUN wget https://mirror.ghproxy.com/https://github.com/gohugoio/hugo/releases/...
```

**解决方案 2** - 预下载到 `bin/linux/` 并使用 `Dockerfile`

### 构建时间过长

**优化建议**：

1. 使用 Docker BuildKit 缓存：
```bash
DOCKER_BUILDKIT=1 docker build -f docker/Dockerfile.ci .
```

2. 使用 CI 缓存（GitHub Actions 已配置）

3. 本地开发使用 `Dockerfile`（复用本地二进制）

---

## 🌟 推荐工作流

### 本地开发
```bash
make install-tools    # 编译工具
make dev              # 开发模式
make build            # 本地构建
```

### CI/CD 部署
```bash
# 自动触发（推送代码）
git push origin master

# 或使用 Makefile
make docker-build-ci
make docker-push
```

---

## 📚 更多信息

- Hugo 文档: https://gohugo.io/
- Pagefind 文档: https://pagefind.app/
- Docker 文档: https://docs.docker.com/
- 项目工具文档: ../tools/README.md

---

**更新日期**: 2025-11-20
**版本**: Docker 配置 v2.0 (hugo-teek-tools 集成)
