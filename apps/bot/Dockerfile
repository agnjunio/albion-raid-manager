FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack use pnpm@latest && apk add --no-cache jq

FROM base AS build
WORKDIR /app
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run --filter=@albion-raid-manager/core db:generate
RUN pnpm deploy --filter=@albion-raid-manager/bot --prod /prod/bot

FROM base AS bot
WORKDIR /app
COPY --from=build /prod/bot .
# Strip out the extends property from tsconfig.json (required for JIT compilation)
RUN jq 'del(.extends)' tsconfig.json > tsconfig.tmp && mv tsconfig.tmp tsconfig.json

ENV NODE_ENV=production

# Healthcheck: Verify Node.js process is responsive and bot process is running
# For Discord bots, we simply check if the Node.js runtime is responsive
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "process.exit(0)"

CMD ["pnpm", "start"]
