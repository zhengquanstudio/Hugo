#!/bin/bash
# Hugo Teek Linux 启动脚本
# 使用预编译二进制启动项目，无需 Makefile

set -e  # 遇到错误立即退出

# ============================================
# 配置区域
# ============================================
THEME="${THEME:-hugo-teek}"               # 默认主题
PORT="${PORT:-8090}"                       # 服务端口
SKIP_VERSION_CHECK="${SKIP_VERSION_CHECK:-false}"  # 是否跳过版本检查
SKIP_SEARCH_INDEX="${SKIP_SEARCH_INDEX:-false}"   # 是否跳过搜索索引（快速启动）

# ============================================
# 0. 初始化
# ============================================
echo "=========================================="
echo "Hugo Teek 启动脚本 (Linux)"
echo "=========================================="

# 切换到项目根目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "项目根目录: $PROJECT_ROOT"
echo "主题: $THEME"
echo "端口: $PORT"
echo ""

# ============================================
# 自动下载工具（如果缺失）
# ============================================
if [ ! -f "bin/linux/hugo-teek-tools" ] || [ ! -f "bin/linux/hugo" ]; then
    echo "▶ 检测到缺失工具，开始自动下载..."
    echo ""

    if [ -f "bin/linux/check-and-install.sh" ]; then
        bash bin/linux/check-and-install.sh
        if [ $? -ne 0 ]; then
            echo ""
            echo "❌ 工具下载失败"
            echo "请手动从项目发布页面下载 hugo-teek-tools 和 hugo"
            exit 1
        fi
    else
        echo "❌ 错误: 未找到 bin/linux/check-and-install.sh"
        echo "请从项目发布页面下载完整的 bin/linux/ 目录"
        exit 1
    fi
    echo ""
fi

# 检查二进制文件是否存在
if [ ! -f "bin/linux/hugo-teek-tools" ]; then
    echo "❌ 错误: 未找到 bin/linux/hugo-teek-tools"
    echo "请确保预编译二进制文件存在"
    exit 1
fi

if [ ! -f "bin/linux/hugo" ]; then
    echo "❌ 错误: 未找到 bin/linux/hugo"
    echo "请确保预编译二进制文件存在"
    exit 1
fi

# 确保二进制可执行
chmod +x bin/linux/hugo-teek-tools
chmod +x bin/linux/hugo

# ============================================
# 1. 版本检查（可选）
# ============================================
if [ "$SKIP_VERSION_CHECK" != "true" ] && [ -f "bin/linux/check-version.sh" ]; then
    echo "▶ 检查工具版本..."
    bash bin/linux/check-version.sh || true  # 失败不退出
fi

# ============================================
# 2. 清理端口占用
# ============================================
echo ""
echo "▶ 清理端口占用..."
# 清理前端端口 (8090)，保留配置中心端口 (8888)
if lsof -ti:$PORT >/dev/null 2>&1; then
    echo "  - 发现端口 $PORT 被占用，正在清理..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# ============================================
# 3. 清理旧文件
# ============================================
echo ""
echo "▶ 清理旧文件..."
bin/linux/hugo-teek-tools clean

# 额外清理侧边栏数据
rm -rf hugo-teek-site/data/sidebar
rm -rf hugo-teek-site/static/data/sidebar

# ============================================
# 4. 合并配置
# ============================================
echo ""
echo "▶ 合并配置文件..."
bin/linux/hugo-teek-tools config merge

# ============================================
# 5. 数据生成流程
# ============================================
echo ""
echo "=========================================="
echo "数据生成流程"
echo "=========================================="

# 5.1 修复前言
echo ""
echo "▶ [1/8] 修复 YAML 前言..."
bin/linux/hugo-teek-tools frontmatter

# 5.2 生成永久链接
echo ""
echo "▶ [2/8] 生成永久链接..."
bin/linux/hugo-teek-tools permalink

# 5.3 生成索引页
echo ""
echo "▶ [3/8] 生成索引页..."
bin/linux/hugo-teek-tools index

# 5.4 生成侧边栏
echo ""
echo "▶ [4/8] 生成侧边栏导航..."
bin/linux/hugo-teek-tools sidebar

# 复制侧边栏数据到静态目录
if [ -d "hugo-teek-site/data/sidebar" ]; then
    mkdir -p hugo-teek-site/static/data/sidebar
    cp -r hugo-teek-site/data/sidebar/* hugo-teek-site/static/data/sidebar/
fi

# 5.5 VitePress 转换
echo ""
echo "▶ [5/8] VitePress 语法转换..."
bin/linux/hugo-teek-tools convert

# 5.6 文档分析
echo ""
echo "▶ [6/8] 生成文档分析数据..."
bin/linux/hugo-teek-tools analysis

# 5.7 搜索索引（耗时，可跳过）
echo ""
if [ "$SKIP_SEARCH_INDEX" = "true" ]; then
    echo "▶ [7/8] 跳过搜索索引生成（快速启动模式）"
else
    echo "▶ [7/8] 生成搜索索引（约 30-40 秒）..."
    bin/linux/hugo-teek-tools search
fi

# 5.8 微信文章分割（可选）
echo ""
echo "▶ [8/9] 处理微信专属内容..."
bin/linux/hugo-teek-tools wechat || true  # 失败不退出

# ============================================
# 6. 启动内容监听器
# ============================================
echo ""
echo "▶ [9/9] 启动内容监听器..."
echo "  监听目录: content/ (自动转换 VitePress 语法)"

# 检查是否已在运行
if [ -f .content-watcher.pid ]; then
    WATCHER_PID=$(cat .content-watcher.pid)
    if kill -0 "$WATCHER_PID" 2>/dev/null; then
        echo "  ⚠️  监听器已在运行 (PID: $WATCHER_PID)，跳过启动"
    else
        echo "  🧹 清理过期的 PID 文件..."
        rm .content-watcher.pid

        # 启动 hugo-teek-tools watch
        if [ -f "bin/linux/hugo-teek-tools" ]; then
            echo "  🚀 启动 hugo-teek-tools watch..."
            nohup ./bin/linux/hugo-teek-tools watch > .content-watcher.log 2>&1 &
            WATCHER_PID=$!
            echo $WATCHER_PID > .content-watcher.pid

            sleep 1

            if kill -0 "$WATCHER_PID" 2>/dev/null; then
                echo "  ✅ 内容监听器已启动 (PID: $WATCHER_PID)"
                echo "  📋 日志文件: .content-watcher.log"
            else
                echo "  ❌ 监听器启动失败，查看日志: .content-watcher.log"
            fi
        else
            echo "  ⚠️  hugo-teek-tools 未找到，跳过监听器"
        fi
    fi
else
    # 首次启动
    if [ -f "bin/linux/hugo-teek-tools" ]; then
        echo "  🚀 启动 hugo-teek-tools watch..."
        nohup ./bin/linux/hugo-teek-tools watch > .content-watcher.log 2>&1 &
        WATCHER_PID=$!
        echo $WATCHER_PID > .content-watcher.pid

        sleep 1

        if kill -0 "$WATCHER_PID" 2>/dev/null; then
            echo "  ✅ 内容监听器已启动 (PID: $WATCHER_PID)"
            echo "  📋 日志文件: .content-watcher.log"
        else
            echo "  ❌ 监听器启动失败，查看日志: .content-watcher.log"
        fi
    else
        echo "  ⚠️  hugo-teek-tools 未找到，跳过监听器"
    fi
fi

# ============================================
# 7. 启动 Hugo 服务
# ============================================
# 清理函数
cleanup() {
    echo ""
    echo "🛑 停止开发服务器..."

    # 停止内容监听器
    if [ -f .content-watcher.pid ]; then
        PID=$(cat .content-watcher.pid)
        if kill -0 $PID 2>/dev/null; then
            echo "  停止内容监听器 (PID: $PID)..."
            kill $PID 2>/dev/null || true
        fi
        rm .content-watcher.pid
    fi

    echo "✅ 清理完成"
    exit 0
}

# 设置信号陷阱
trap cleanup INT TERM

echo ""
echo "=========================================="
echo "启动 Hugo 开发服务器"
echo "=========================================="
echo ""
echo "主题: $THEME"
echo "端口: $PORT"
echo "访问地址: http://localhost:$PORT"
echo ""
echo "🚀 启动中..."
echo "  📂 内容目录: .content-vp-converted (VitePress 语法已转换)"
echo "  👁️  内容监听: 已启用 (编辑 content/ 将自动转换)"
echo "  💡 按 Ctrl+C 停止 (会自动清理后台进程)"
echo ""

# 启动 Hugo 开发服务器（前台运行）
bin/linux/hugo server \
    --environment="$THEME" \
    --source="$PROJECT_ROOT/hugo-teek-site" \
    --contentDir="$PROJECT_ROOT/hugo-teek-site/.content-vp-converted" \
    --bind=0.0.0.0 \
    --port=$PORT \
    --buildDrafts \
    --logLevel=info \
    --poll 500ms \
    --disableFastRender

# Hugo 退出后执行清理
cleanup
