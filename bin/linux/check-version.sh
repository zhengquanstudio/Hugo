#!/bin/bash
# ====================================================
# Hugo Teek Tools - 多工具版本检查和自动安装脚本 (Linux)
# ====================================================
# 检查并自动安装 hugo-teek-tools, hugo
# ====================================================

# 注意: 不使用 set -e，因为我们需要更精细的错误控制

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 配置
VERSION_API_URL="https://download.xxdevops.cn/list"
VERSION_API_TIMEOUT=3
BIN_DIR="bin/linux"

# 项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

# 工具配置: 工具名称|本地路径|JSON键名|版本命令|版本提取正则
declare -a TOOLS=(
    "hugo-teek-tools|$BIN_DIR/hugo-teek-tools|hugo-teek-tools.linux.hugo-teek-tools|--version|version \K[\d.]+"
    "hugo|$BIN_DIR/hugo|hugo-teek-tools.linux.hugo|version|v\K[\d.]+"
)

# 统计
INSTALLED_COUNT=0
UPDATED_COUNT=0
FAILED_COUNT=0

# ====================================================
# 函数: 静默退出
# ====================================================
silent_exit() {
    exit 0
}

# ====================================================
# 函数: 获取远程数据
# ====================================================
get_remote_data() {
    # 检查 curl 是否可用
    if ! command -v curl &> /dev/null; then
        return 1
    fi

    # 请求 API
    local response=$(curl -s --connect-timeout "$VERSION_API_TIMEOUT" --max-time "$VERSION_API_TIMEOUT" "$VERSION_API_URL" 2>/dev/null || echo "")

    # 检查响应是否为空
    if [ -z "$response" ]; then
        return 1
    fi

    echo "$response"
    return 0
}

# ====================================================
# 函数: 从JSON提取值
# ====================================================
extract_json_value() {
    local json="$1"
    local path="$2"  # 例如: hugo-teek-tools.version 或 hugo-teek-tools.linux.hugo

    # 检查 jq 是否可用
    if command -v jq &> /dev/null; then
        # 将路径转换为 jq 格式: .["hugo-teek-tools"].version
        local jq_path=$(echo "$path" | sed 's/\./\"\].\[\"/g' | sed 's/^/.[\"/;s/$/\"]/')
        echo "$json" | jq -r "$jq_path" 2>/dev/null
    else
        # 使用 grep + sed 简单解析（不够健壮,但作为备选方案）
        local value=$(echo "$json" | grep -oP "\"${path##*.}\"\s*:\s*\"\K[^\"]+")
        echo "$value"
    fi
}

# ====================================================
# 函数: 获取本地工具版本
# ====================================================
get_local_version() {
    local tool_path="$1"
    local version_cmd="$2"
    local version_regex="$3"

    if [ ! -f "$tool_path" ]; then
        echo ""
        return 1
    fi

    # 运行版本命令
    local version_output=$("$tool_path" $version_cmd 2>/dev/null || echo "")

    if [ -z "$version_output" ]; then
        echo ""
        return 1
    fi

    # 提取版本号
    local version=$(echo "$version_output" | grep -oP "$version_regex" | head -1)

    echo "$version"
    return 0
}

# ====================================================
# 函数: 下载文件
# ====================================================
download_file() {
    local url="$1"
    local output_file="$2"

    if ! curl -L --progress-bar -o "$output_file" "$url" 2>&1; then
        return 1
    fi

    # 检查文件是否存在且非空
    if [ ! -s "$output_file" ]; then
        rm -f "$output_file"
        return 1
    fi

    return 0
}

# ====================================================
# 函数: 安装工具
# ====================================================
install_tool() {
    local tool_name="$1"
    local tool_path="$2"
    local download_url="$3"

    local temp_file="/tmp/${tool_name}.download.$$"

    echo -e "${BLUE}📥 下载 $tool_name...${NC}"

    # 下载
    if ! download_file "$download_url" "$temp_file"; then
        echo -e "${RED}❌ 下载失败${NC}"
        return 1
    fi

    # 创建目录
    mkdir -p "$(dirname "$tool_path")"

    # 直接移动二进制文件
    mv "$temp_file" "$tool_path"

    # 赋予执行权限
    chmod +x "$tool_path"

    echo -e "${GREEN}✅ 下载完成${NC}"

    return 0
}

# ====================================================
# 函数: 处理单个工具
# ====================================================
process_tool() {
    local tool_name="$1"
    local tool_path="$2"
    local json_key="$3"
    local version_cmd="$4"
    local version_regex="$5"
    local remote_data="$6"

    # 获取本地版本
    local local_version=$(get_local_version "$tool_path" "$version_cmd" "$version_regex")

    # 获取远程版本和下载URL
    # 注意: 所有工具共享同一个version字段
    local remote_version_raw=$(extract_json_value "$remote_data" "hugo-teek-tools.version")
    local download_url=$(extract_json_value "$remote_data" "$json_key")

    # 从远程版本字符串中提取版本号（格式: "hugo-teek-tools version 3.0 (commit: ...)"）
    local remote_version=$(echo "$remote_version_raw" | grep -oP "version \K[\d.]+" | head -1)

    # 如果提取失败，尝试直接使用原始字符串
    if [ -z "$remote_version" ]; then
        remote_version="$remote_version_raw"
    fi

    # 检查是否成功获取远程信息
    if [ -z "$remote_version" ] || [ -z "$download_url" ]; then
        echo -e "${YELLOW}⚠️  无法获取 $tool_name 的远程信息${NC}"
        return 1
    fi

    # 如果本地不存在，安装
    if [ -z "$local_version" ]; then
        echo ""
        echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
        echo -e "${CYAN}║${NC}  📦 ${YELLOW}安装 $tool_name${NC}                            ${CYAN}║${NC}"
        echo -e "${CYAN}╠════════════════════════════════════════════════════════╣${NC}"
        printf "${CYAN}║${NC}  版本: ${GREEN}%-44s${NC} ${CYAN}║${NC}\n" "$remote_version"
        echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
        echo ""

        if install_tool "$tool_name" "$tool_path" "$download_url"; then
            # 验证安装
            local installed_version=$(get_local_version "$tool_path" "$version_cmd" "$version_regex")
            if [ -n "$installed_version" ]; then
                echo -e "${GREEN}✅ $tool_name 安装成功! (版本: $installed_version)${NC}"
                echo ""
                INSTALLED_COUNT=$((INSTALLED_COUNT + 1))
                return 0
            else
                echo -e "${RED}❌ $tool_name 安装验证失败${NC}"
                echo ""
                FAILED_COUNT=$((FAILED_COUNT + 1))
                return 1
            fi
        else
            FAILED_COUNT=$((FAILED_COUNT + 1))
            return 1
        fi
    fi

    # 本地已存在，检查是否需要更新
    # 注意: 只对 hugo-teek-tools 进行版本更新检查
    # hugo 的版本号在 API 中不准确，跳过更新检查
    # 跳过本地开发版本 (版本号为 "dev")
    if [ "$tool_name" = "hugo-teek-tools" ] && [ "$local_version" = "dev" ]; then
        echo -e "${BLUE}ℹ️  检测到本地开发版本 (dev)，跳过版本检查${NC}"
        return 0
    fi

    if [ "$tool_name" = "hugo-teek-tools" ] && [ "$local_version" != "$remote_version" ]; then
        echo ""
        echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
        echo -e "${CYAN}║${NC}  🎉 ${YELLOW}发现 $tool_name 新版本!${NC}                     ${CYAN}║${NC}"
        echo -e "${CYAN}╠════════════════════════════════════════════════════════╣${NC}"
        printf "${CYAN}║${NC}  当前版本: ${RED}%-40s${NC} ${CYAN}║${NC}\n" "$local_version"
        printf "${CYAN}║${NC}  最新版本: ${GREEN}%-40s${NC} ${CYAN}║${NC}\n" "$remote_version"
        echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
        echo ""

        # 询问用户是否更新
        echo -n -e "${YELLOW}是否更新 $tool_name? [Y/n]: ${NC}"
        read -r response
        response=${response:-Y}

        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}⏭️  跳过更新 $tool_name${NC}"
            echo ""
            return 0
        fi

        # 备份
        local backup_file="${tool_path}.bak"
        cp "$tool_path" "$backup_file"

        # 下载并安装
        if install_tool "$tool_name" "$tool_path" "$download_url"; then
            # 验证
            local new_version=$(get_local_version "$tool_path" "$version_cmd" "$version_regex")
            if [ "$new_version" = "$remote_version" ]; then
                echo -e "${GREEN}✅ $tool_name 更新成功! ($local_version → $new_version)${NC}"
                echo ""
                rm -f "$backup_file"
                UPDATED_COUNT=$((UPDATED_COUNT + 1))
                return 0
            else
                echo -e "${RED}❌ $tool_name 更新验证失败，恢复旧版本...${NC}"
                mv "$backup_file" "$tool_path"
                echo ""
                FAILED_COUNT=$((FAILED_COUNT + 1))
                return 1
            fi
        else
            echo -e "${RED}❌ $tool_name 更新失败，恢复旧版本...${NC}"
            mv "$backup_file" "$tool_path"
            echo ""
            FAILED_COUNT=$((FAILED_COUNT + 1))
            return 1
        fi
    fi

    # 版本相同，无需更新
    return 0
}

# ====================================================
# 主流程
# ====================================================

# 获取远程数据
REMOTE_DATA=$(get_remote_data)

if [ -z "$REMOTE_DATA" ]; then
    # 网络不通或 API 错误
    # 检查是否所有工具都已安装
    all_installed=true
    for tool_config in "${TOOLS[@]}"; do
        IFS='|' read -r tool_name tool_path json_key version_cmd version_regex <<< "$tool_config"
        if [ ! -f "$tool_path" ]; then
            all_installed=false
            echo -e "${RED}❌ 错误: $tool_name 未安装，且无法连接到远程服务器${NC}"
        fi
    done

    if [ "$all_installed" = false ]; then
        echo -e "   请检查网络连接或手动运行: ${YELLOW}make install-tools${NC} 和 ${YELLOW}make download-tools${NC}"
        exit 1
    fi

    # 所有工具都已安装，静默跳过
    silent_exit
fi

# 处理每个工具
for tool_config in "${TOOLS[@]}"; do
    IFS='|' read -r tool_name tool_path json_key version_cmd version_regex <<< "$tool_config"
    process_tool "$tool_name" "$tool_path" "$json_key" "$version_cmd" "$version_regex" "$REMOTE_DATA"
done

# 总结
if [ $INSTALLED_COUNT -gt 0 ] || [ $UPDATED_COUNT -gt 0 ] || [ $FAILED_COUNT -gt 0 ]; then
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}工具检查完成${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    [ $INSTALLED_COUNT -gt 0 ] && echo -e "  ${GREEN}✅ 新安装: $INSTALLED_COUNT 个工具${NC}"
    [ $UPDATED_COUNT -gt 0 ] && echo -e "  ${GREEN}✅ 已更新: $UPDATED_COUNT 个工具${NC}"
    [ $FAILED_COUNT -gt 0 ] && echo -e "  ${RED}❌ 失败: $FAILED_COUNT 个工具${NC}"
    echo ""
fi

exit 0
