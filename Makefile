.PHONY: help dev build clean check-bins install-tools download-tools fix-frontmatter gen-permalink gen-sidebar-order gen-index gen-doc-analysis start-config remove-coverimg rebuild-data stop-content-watcher cleanup-dev quick build-docker docker-build docker-build-ci docker-run docker-push check-version clean-keep-index rebuild-fast build-fastest build-optimized

# 全局强制关闭 VitePress 转换
export DISABLE_VP_CONVERT=true
export ENABLE_VP_CONVERT=false

help:
	@echo "Hugo Teeker Theme （已关闭 VitePress 转译）"
	@echo "make dev               启动原生 Hugo 服务"
	@echo "make build             生产构建"
	@echo "make clean             清理缓存"

BIN_DIR = bin/windows
TOOLS_BIN = $(BIN_DIR)/hugo-teek-tools.exe

THEME = hugo-teeker
HUGO_ENV = --environment=$(THEME)

FRONTEND_PORT ?= 8090
BACKEND_PORT ?= 8888

clean-ports:
	@echo "🧹 清理端口占用"

install-tools:
	@echo "🔨 工具已禁用"

check-bins:
	@true

check-version:
	@true

merge-config:
	@echo "⚙️  配置合并已跳过"

fix-frontmatter:
	@true

gen-permalink:
	@true

gen-sidebar-order:
	@true

gen-sidebar-split: gen-sidebar-order

gen-index:
	@true

gen-search-index:
	@true

gen-doc-analysis:
	@true

start-config:
	@true

stop-config:
	@true

stop-content-watcher:
	@true

cleanup-dev:
	@true

# ============================
# 🔥 核心：原生 Hugo 启动，无任何转换
# ============================
dev: clean
	@echo "🚀 启动原生 Hugo（无 VitePress）"
	hugo server \
	--source=hugo-teek-site \
	--port=$(FRONTEND_PORT) \
	--bind=0.0.0.0 \
	--buildDrafts \
	--disableFastRender \
	--contentDir=content \
	--noHTTPCache

# ============================
# 🔥 生产构建：原生模式
# ============================
build: clean
	@echo "🏗️  生产构建（原生 Hugo）"
	hugo \
	--source=hugo-teek-site \
	--contentDir=content \
	--minify

quick:
	@echo "⚡ 快速启动（原生）"
	hugo server \
	--source=hugo-teek-site \
	--port=8090 \
	--contentDir=content

clean:
	@echo "🧹 清理中..."
	rm -rf hugo-teek-site/public
	rm -rf hugo-teek-site/resources
	rm -rf hugo-teek-site/.content-vp-converted
	rm -rf .content-vp-converted
	@echo "✅ 清理完成！"

rebuild-data:
	@true

remove-coverimg:
	@true

docker-build:
	@echo "🐳 Docker 已禁用"