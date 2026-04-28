# Hugo Teek - Windows 使用指南

本指南介绍如何在 Windows 环境下使用 Hugo Teek Theme。

## 目录

- [快速开始](#快速开始)
- [端口配置](#端口配置)
- [可用脚本](#可用脚本)
- [常见问题](#常见问题)

## 快速开始

### 1. 环境要求

- Windows 10/11
- Node.js (推荐 v18 或更高版本)
- npm 或 pnpm

### 2. Git 配置（首次克隆）

本项目使用以下行尾策略：

- **批处理文件** (`.bat`, `.cmd`): 使用 **CRLF (Windows 风格)** 行尾，因为 Windows CMD.exe 要求 CRLF 才能正确解析
- **其他文件**: 使用 **LF (Unix 风格)** 行尾，保持跨平台一致性

现代 Windows 10+ 的 PowerShell 和 Git Bash 可以处理 LF 行尾，但传统的批处理文件必须使用 CRLF。

Windows 开发者首次克隆仓库时，Git 会自动根据 `.gitattributes` 配置处理行尾：

```bash
git clone <repo-url>
```

无需手动配置 `core.autocrlf`，`.gitattributes` 文件已确保批处理文件使用 CRLF。

### 3. 首次运行

双击运行以下脚本之一：

- `start.bat` - 启动 Hugo 开发服务器
- `start-admin.bat` - 启动管理后台（前端 + 后端）

## 端口配置

为避免 Windows 和 Linux 环境之间的端口冲突，Hugo Teek 为两个平台配置了不同的默认端口。

### 默认端口分配

| 服务 | Linux 默认端口 | Windows 默认端口 | 环境变量 |
|------|----------------|------------------|----------|
| Vite 前端开发服务器 | 5173 | 6173 | `HUGO_TEEK_VITE_PORT` |
| Hugo 开发服务器 | 8090 | 9090 | `HUGO_TEEK_HUGO_PORT` |
| 后端管理服务器 | 8888 | 9888 | `HUGO_TEEK_PORT` |

### 自定义端口配置

#### 方法 1：通过 `.env` 文件（推荐）

1. 在项目根目录找到 `.env` 文件（首次运行脚本会自动创建）
2. 编辑 `.env` 文件，修改以下配置：

```bash
# Windows 环境端口配置
HUGO_TEEK_PORT=9888          # 后端管理服务器端口
HUGO_TEEK_HUGO_PORT=9090     # Hugo 开发服务器端口
HUGO_TEEK_VITE_PORT=6173     # Vite 前端开发服务器端口
```

3. 保存文件并重新运行启动脚本

#### 方法 2：临时修改环境变量

在运行脚本前，在命令行中设置环境变量：

```cmd
set HUGO_TEEK_PORT=9999
set HUGO_TEEK_HUGO_PORT=8888
set HUGO_TEEK_VITE_PORT=7777
start.bat
```

### 端口使用说明

- **Hugo 开发服务器** (`start.bat`)
  - 默认访问地址：`http://localhost:9090`
  - 用于预览和开发 Hugo 静态网站

- **管理后台** (`start-admin.bat`)
  - 前端访问地址：`http://localhost:6173/admin`
  - 后端 API 地址：`http://localhost:9888`
  - 用于管理网站内容、图库、菜单等

## 可用脚本

### 开发脚本

| 脚本 | 功能 | 端口 |
|------|------|------|
| `start.bat` | 启动 Hugo 开发服务器 | 9090 |
| `start-admin.bat` | 启动管理后台（前端 + 后端） | 6173, 9888 |
| `init-env.bat` | 初始化环境变量 | - |
| `check-and-install.bat` | 检查并安装所需工具 | - |

### 工具脚本

| 脚本 | 功能 |
|------|------|
| `hugo-teek-tools.exe` | 统一 CLI 工具（数据生成、配置管理等） |
| `hugo.exe` | Hugo 静态网站生成器 |

## 常见问题

### 1. 端口被占用

**问题**：启动服务时提示端口被占用

**解决方案**：
1. 检查端口占用情况：
   ```cmd
   netstat -ano | findstr ":9090"
   ```
2. 方案 A：结束占用端口的进程
3. 方案 B：修改 `.env` 文件使用其他端口

### 2. Hugo 或 hugo-teek-tools 未找到

**问题**：运行脚本时提示 `hugo.exe` 或 `hugo-teek-tools.exe` 未找到

**解决方案**：
1. 运行 `check-and-install.bat` 自动下载所需工具
2. 或者手动下载：
   - Hugo: https://github.com/gohugoio/hugo/releases
   - hugo-teek-tools: https://download.xxdevops.cn/dist/hugo-teek-tools/win/

### 3. 前后端无法通信

**问题**：管理后台前端无法访问后端 API

**常见症状**：
- 前端显示 "Failed to fetch" 或 "ERR_CONNECTION_REFUSED"
- 浏览器控制台显示 `http://localhost:9888` 连接失败
- 前端页面加载但 API 请求失败

**解决方案**：

#### 步骤 1：检查后端是否真正启动

1. 查看后端日志文件：
   ```cmd
   type .config-server.log
   ```
   或查看最后 30 行：
   ```cmd
   powershell -Command "Get-Content .config-server.log -Tail 30"
   ```

2. 成功启动的日志应包含：
   ```
   管理后台服务启动，监听端口: :9888
   ```

3. 如果日志文件不存在或没有上述内容，后端未成功启动

#### 步骤 2：验证后端端口监听

检查端口 9888 是否在监听：
```cmd
netstat -ano | findstr ":9888" | findstr "LISTENING"
```

应该看到类似输出：
```
TCP    0.0.0.0:9888          0.0.0.0:0              LISTENING       12345
```

如果没有任何输出，说明后端未在 9888 端口监听。

#### 步骤 3：测试后端 API 端点

使用浏览器或 PowerShell 测试健康检查端点：
```cmd
powershell -Command "Invoke-WebRequest -Uri 'http://localhost:9888/ping' -UseBasicParsing"
```

成功响应应返回 `pong`。

#### 步骤 4：检查环境变量配置

验证环境变量是否正确加载：

1. 在 `start-admin.bat` 启动时，检查控制台输出：
   ```
   Environment Configuration:
     Backend PORT: 9888        <-- 应该有值
     Vite PORT: 6173           <-- 应该有值
     HUGO_TEEK_MODE: debug     <-- 应该有值
   ```

2. 如果 Backend PORT 显示为空，说明 `.env` 文件解析失败

3. 手动检查 `.env` 文件内容：
   ```cmd
   type .env | findstr "HUGO_TEEK_PORT"
   ```
   应该显示：
   ```
   HUGO_TEEK_PORT=9888
   ```

#### 步骤 5：调试环境变量

如果环境变量未正确加载：

1. 检查 `.env` 文件编码（应为 UTF-8）
2. 检查是否包含 BOM（字节顺序标记）- 应删除
3. 检查行尾格式（应为 LF，不是 CRLF）
4. 确保 `HUGO_TEEK_PORT=9888` 行没有多余空格

手动验证环境变量解析：
```cmd
cd bin\windows
call init-env.bat
echo Backend PORT: %HUGO_TEEK_PORT%
```

#### 步骤 6：手动启动后端排查问题

如果自动启动失败，尝试手动启动后端查看详细错误：
```cmd
bin\windows\hugo-teek-tools.exe server --port 9888 --mode debug
```

观察输出的错误信息，常见问题：
- 端口被占用：更改端口或停止占用进程
- 配置文件错误：检查 `hugo-teek-site/config/` 目录
- 权限问题：以管理员身份运行
- 防火墙阻止：添加防火墙例外

#### 步骤 7：完全清理并重启

如果以上步骤都无效：

1. 停止所有相关进程：
   ```cmd
   taskkill /F /IM hugo-teek-tools.exe
   taskkill /F /IM node.exe
   ```

2. 删除日志文件：
   ```cmd
   del .config-server.log
   del .content-watcher.log
   ```

3. 重新启动：
   ```cmd
   bin\windows\start-admin.bat
   ```

### 4. 中文乱码

**问题**：控制台输出中文乱码

**解决方案**：
- 脚本已自动设置 UTF-8 编码 (`chcp 65001`)
- 如仍有问题，请手动在命令行执行：
  ```cmd
  chcp 65001
  ```

### 5. WSL 和 Windows 同时运行冲突

**问题**：在 WSL 和 Windows 上同时运行开发服务器，端口冲突

**解决方案**：
- Windows 默认使用 6173/9090/9888 端口
- Linux/WSL 默认使用 5173/8090/8888 端口
- 两者可以同时运行而不会冲突

### 6. 后端端口不匹配

**问题**：后端服务器运行在 8888 端口（Linux 默认），但脚本期望 9888 端口（Windows 默认）

**症状**：
- 前端无法连接到后端
- 脚本报告"Backend failed to start"
- `.config-server.log` 显示端口 8888，而非 9888

**解决方案**：

1. **停止所有后端进程**：
   ```cmd
   bin\windows\stop-backend.bat
   ```

2. **验证 .env 配置**：
   ```bash
   # .env 文件应包含：
   HUGO_TEEK_PORT=9888
   ```

3. **重新启动**：
   ```cmd
   bin\windows\start-admin.bat
   ```

4. **验证端口**：
   ```cmd
   netstat -ano | findstr ":9888" | findstr "LISTENING"
   ```
   应显示端口 9888 正在监听

**原因**：
- `init-env.bat` 自动设置 Windows 端口 (9888)
- 但如果环境变量未正确传递给 Go 进程，服务器会使用默认端口 (8888)
- 可能由于之前在 WSL/Linux 环境运行过服务器，导致端口混乱


## 高级配置

### 环境变量完整列表

除端口配置外，`.env` 文件还支持以下配置：

```bash
# 项目路径
HUGO_TEEK_BASE_DIR=<项目��目录>
HUGO_TEEK_SITE_DIR=<Hugo 站点目录>
HUGO_TEEK_DATA_DIR=<数据目录>
HUGO_TEEK_STATIC_DIR=<静态资源目录>
HUGO_TEEK_CONTENT_DIR=<内容目录>

# 服务器配置
HUGO_TEEK_HOST=0.0.0.0       # 服务主机地址
HUGO_TEEK_MODE=debug         # 运行模式 (debug|release)

# 图库配置
GALLERY_DATA_FILE=<图库数据文件路径>
ALBUMS_DATA_FILE=<相册数据文件路径>
GALLERY_UPLOAD_DIR=<图片上传目录>
IMAGE_CONVERT_ENABLED=true   # 图片转换开关
IMAGE_CONVERT_QUALITY=85     # 图片转换质量

# 菜单配置
MENU_DATA_FILE=<菜单数据文件路径>
```

### 日志文件

- `.content-watcher.log` - 内容监听器日志
- `.config-server.log` - 配置服务器日志

## 支持

如遇到问题，请：

1. 检查日志文件 (`.content-watcher.log`, `.config-server.log`)
2. 查阅项目主 README.md
3. 提交 Issue 到项目仓库

## 相关资源

- [Hugo 官方文档](https://gohugo.io/documentation/)
- [Vite 官方文档](https://vitejs.dev/)
- [项目主 README](../../README.md)
