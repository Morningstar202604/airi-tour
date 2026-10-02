#!/usr/bin/env bash
# 文旅助手 · 一键启动（开发模式）
set -e
cd "$(dirname "$0")"

if [ ! -d node_modules ]; then
  echo "首次运行，安装依赖..."
  pnpm install --ignore-scripts
fi

echo "启动文旅助手 Web 版：http://localhost:5173"
pnpm dev:web
