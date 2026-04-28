#!/bin/bash
# Hugo Teek 快速启动脚本
# 跳过搜索索引生成，适合快速预览

export SKIP_SEARCH_INDEX=true
bash "$(dirname "$0")/start.sh"
