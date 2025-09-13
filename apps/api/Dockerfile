FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack use pnpm@latest && apk add --no-cache jq

FROM base AS build
WORKDIR /app
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run --filter=@albion-raid-manager/core db:generate
RUN pnpm deploy --filter=@albion-raid-manager/api --prod /prod/api

FROM base AS api
WORKDIR /app
COPY --from=build /prod/api .
# Strip out the extends property from tsconfig.json (required for JIT compilation)
RUN jq 'del(.extends)' tsconfig.json > tsconfig.tmp && mv tsconfig.tmp tsconfig.json

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

CMD ["pnpm", "start"]
