# 文旅助手 · Linux 网关镜像
# 构建上下文为仓库根目录：docker build -f server/Dockerfile .

# ---------- 阶段 1：安装依赖 + 构建前端 ----------
FROM node:22-slim AS builder

RUN corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY apps/stage-web/package.json apps/stage-web/
COPY packages/ packages/
COPY server/ server/

RUN pnpm install --ignore-scripts --frozen-lockfile=false
RUN pnpm build:web

# ---------- 阶段 2：运行 ----------
FROM node:22-slim

RUN corepack enable
WORKDIR /app

COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/packages packages
COPY --from=builder /app/server server
COPY --from=builder /app/apps/stage-web/dist apps/stage-web/dist
COPY --from=builder /app/package.json package.json

ENV PORT=8080
EXPOSE 8080

CMD ["pnpm", "--filter", "@wenlv/gateway", "start"]
