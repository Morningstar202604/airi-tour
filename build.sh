#!/usr/bin/env bash
# 文旅助手 · 生产构建
set -e
cd "$(dirname "$0")"

echo "构建 Web 版（产物在 apps/stage-web/dist）..."
pnpm build:web

echo ""
echo "完成。可用任意静态服务器托管 apps/stage-web/dist，例如："
echo "  npx serve apps/stage-web/dist"
echo "  python3 -m http.server 8080 -d apps/stage-web/dist"
