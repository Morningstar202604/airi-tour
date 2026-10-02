#!/usr/bin/env bash
# 文旅助手 · Linux 网关一键启动（免 Docker）
set -e
cd "$(dirname "$0")/.."

# 加载 .env（若存在）
if [ -f server/.env ]; then
  set -a
  . server/.env
  set +a
fi

# 首次运行安装依赖
if [ ! -d node_modules ]; then
  echo "首次运行，安装依赖..."
  pnpm install --ignore-scripts
fi

# 构建前端（如尚未构建）
if [ ! -f apps/stage-web/dist/index.html ]; then
  echo "构建前端..."
  pnpm build:web
fi

echo "启动文旅助手 Linux 网关：http://localhost:${PORT:-8080}"
pnpm --filter @wenlv/gateway start
