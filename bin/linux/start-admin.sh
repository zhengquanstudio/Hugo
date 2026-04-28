#!/bin/bash
# Hugo Teek 管理后台启动脚本

set -e

echo "=========================================="
echo "Hugo Teek 管理后台启动"
echo "=========================================="

# 切换到项目根目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

# 配置
BACKEND_PORT="${BACKEND_PORT:-8888}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

echo "项目根目录: $PROJECT_ROOT"
echo "后端端口: $BACKEND_PORT"
echo "前端端口: $FRONTEND_PORT"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到 npm"
    exit 1
fi

# 检查二进制文件
if [ ! -f "bin/linux/hugo-teek-tools" ]; then
    echo "⚠️  hugo-teek-tools not found"
    echo "📥 Auto-downloading required tools..."
    echo ""

    # Call auto-download script
    if ! "$SCRIPT_DIR/check-and-install.sh"; then
        echo "❌ Failed to download hugo-teek-tools"
        echo ""
        echo "Please manually run: bin/linux/check-and-install.sh"
        echo "Or download from: https://download.xxdevops.cn/dist/hugo-teek-tools/linux/"
        exit 1
    fi
    echo ""
fi

echo "✅ hugo-teek-tools found"
echo ""

# 确保二进制可执行
chmod +x bin/linux/hugo-teek-tools

# 安装前端依赖（如果需要）
if [ ! -d "admin-frontend/node_modules" ]; then
    echo "▶ 安装前端依赖..."
    cd admin-frontend
    npm install
    cd ..
fi

# 启动后端服务（后台运行）
echo ""
echo "▶ 启动后端服务..."
bin/linux/hugo-teek-tools server --port=$BACKEND_PORT --mode=debug &
BACKEND_PID=$!
echo "  后端 PID: $BACKEND_PID"
echo "  后端 API: http://localhost:$BACKEND_PORT"

# 等待后端启动
sleep 2

# 启动前端服务
echo ""
echo "▶ 启动前端服务..."
cd admin-frontend
echo "  前端 UI: http://localhost:$FRONTEND_PORT"
echo ""
npm run dev

# 清理后端进程
echo ""
echo "停止后端服务..."
kill $BACKEND_PID 2>/dev/null || true
