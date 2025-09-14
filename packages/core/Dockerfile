FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack use pnpm@latest && apk add --no-cache jq

FROM base AS build
WORKDIR /app
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm deploy --filter=@albion-raid-manager/core --prod /prod/core

FROM base AS core
WORKDIR /app
COPY --from=build /prod/core .
# Strip out the extends property from tsconfig.json (required for JIT compilation)
RUN jq 'del(.extends)' tsconfig.json > tsconfig.tmp && mv tsconfig.tmp tsconfig.json

ENV NODE_ENV=production

CMD ["pnpm", "db:migrate", "deploy"]
