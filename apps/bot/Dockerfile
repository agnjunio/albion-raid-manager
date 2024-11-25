# WARNING: This Dockerfile is intended to run in the monorepo root context. Do not change paths!
# To build, use the docker-compose.yml in root instead

FROM node:20-slim AS build

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY turbo.json .

COPY apps/bot apps/bot
COPY packages/logger packages/logger
COPY packages/utils packages/utils

RUN corepack enable && corepack prepare pnpm@9.12.2 --activate
RUN pnpm install -g turbo
RUN pnpm install --frozen-lockfile

CMD ["turbo", "start"]