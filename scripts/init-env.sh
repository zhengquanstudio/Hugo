#!/bin/bash

# Hugo Teek 环境变量初始化脚本
# 用途:
# 1. 如果 .env 不存在，从 .env.example 复制
# 2. 自动检测项目根目录并替换 __PROJECT_ROOT__
# 3. 导出所有环境变量供后续命令使用
# 4. 从 .env.example 同步新变量到现有 .env
#
# 注意: Windows 环境使用 bin/windows/init-env.bat，会自动将端口调整为 +1000
#       (Linux: 8888/8090/5173, Windows: 9888/9090/6173)

set -e

# 获取脚本所在目录的父目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

ENV_FILE="${PROJECT_ROOT}/.env"
ENV_EXAMPLE="${PROJECT_ROOT}/.env.example"

echo "项目根目录: ${PROJECT_ROOT}"

# 检查 .env.example 是否存在
if [ ! -f "${ENV_EXAMPLE}" ]; then
    echo "错误: .env.example 文件不存在"
    exit 1
fi

# Create .env if it doesn't exist, otherwise sync missing variables
if [ ! -f "${ENV_FILE}" ]; then
    echo "创建 .env 文件..."
    # 复制并替换 __PROJECT_ROOT__
    sed "s|__PROJECT_ROOT__|${PROJECT_ROOT}|g" "${ENV_EXAMPLE}" > "${ENV_FILE}"
    echo "✓ .env 文件已创建"
else
    echo "同步 .env 与 .env.example..."

    # Backup existing .env
    cp "${ENV_FILE}" "${ENV_FILE}.backup"

    # Extract variable names from .env.example (skip comments and empty lines)
    example_vars=$(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "${ENV_EXAMPLE}" | sed 's/=.*//')

    # Check each variable and add if missing
    added_count=0
    while IFS= read -r var_name; do
        if ! grep -q "^${var_name}=" "${ENV_FILE}"; then
            # Variable not found in .env, add it
            example_line=$(grep "^${var_name}=" "${ENV_EXAMPLE}")
            # Replace __PROJECT_ROOT__ placeholder
            echo "${example_line}" | sed "s|__PROJECT_ROOT__|${PROJECT_ROOT}|g" >> "${ENV_FILE}"
            echo "[+] Added: ${var_name}"
            ((added_count++))
        fi
    done <<< "${example_vars}"

    if [ ${added_count} -eq 0 ]; then
        echo "✓ .env 已是最新（无新变量）"
    else
        echo "✓ 添加了 ${added_count} 个新变量到 .env"
    fi
fi

# 加载 .env 文件
echo "加载环境变量..."
set -a  # 自动导出所有变量
source "${ENV_FILE}"
set +a

# 展开所有变量引用（如 ${HUGO_TEEK_BASE_DIR}）
# 这一步确保所有路径都被完全解析
eval "$(cat "${ENV_FILE}" | grep -v '^#' | grep '=' | sed 's/^/export /')"

# 输出关键路径配置（用于验证）
echo ""
echo "关键配置:"
echo "  BASE_DIR: ${HUGO_TEEK_BASE_DIR}"
echo "  DATA_DIR: ${HUGO_TEEK_DATA_DIR}"
echo "  STATIC_DIR: ${HUGO_TEEK_STATIC_DIR}"
echo "  GALLERY_DATA: ${GALLERY_DATA_FILE}"
echo "  ALBUMS_DATA: ${ALBUMS_DATA_FILE}"
echo "  PORT: ${HUGO_TEEK_PORT}"
echo ""

# 验证关键目录是否存在
echo "验证目录..."
if [ ! -d "${HUGO_TEEK_DATA_DIR}" ]; then
    echo "警告: 数据目录不存在，正在创建: ${HUGO_TEEK_DATA_DIR}"
    mkdir -p "${HUGO_TEEK_DATA_DIR}"
fi

if [ ! -d "${GALLERY_UPLOAD_DIR}" ]; then
    echo "警告: 图片上传目录不存在，正在创建: ${GALLERY_UPLOAD_DIR}"
    mkdir -p "${GALLERY_UPLOAD_DIR}"
fi

echo "✓ 环境初始化完成"
