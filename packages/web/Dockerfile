# syntax=docker/dockerfile:1.7

# ── builder ────────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ git \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./
COPY packages/core/package.json packages/core/tsconfig.json ./packages/core/
COPY packages/mcp-server/package.json packages/mcp-server/tsconfig.json ./packages/mcp-server/
COPY packages/web/package.json ./packages/web/

RUN pnpm install --frozen-lockfile

COPY packages/core ./packages/core
COPY packages/mcp-server ./packages/mcp-server
COPY packages/web ./packages/web

RUN pnpm -F @document-factory/core build
RUN pnpm -F @document-factory/mcp-server build
RUN pnpm -F @document-factory/web build

# ── runtime ────────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    tini \
    && rm -rf /var/lib/apt/lists/*

RUN useradd --create-home --shell /bin/bash --uid 1001 agent

WORKDIR /app

COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/packages/core/dist ./packages/core/dist
COPY --from=builder /repo/packages/core/package.json ./packages/core/
COPY --from=builder /repo/packages/mcp-server/dist ./packages/mcp-server/dist
COPY --from=builder /repo/packages/mcp-server/package.json ./packages/mcp-server/
COPY --from=builder /repo/packages/web ./packages/web

RUN mkdir -p /workspace && chown -R agent:agent /workspace /app

USER agent
ENV NODE_ENV=production \
    DF_WORKSPACE_DIR=/workspace \
    DF_AGENT_CMD=claude \
    PORT=3000

WORKDIR /app/packages/web

EXPOSE 3000
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "node_modules/.bin/tsx", "server.ts"]
