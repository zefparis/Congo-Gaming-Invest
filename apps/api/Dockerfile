# syntax=docker/dockerfile:1.7

### base
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.10.0 --activate

### deps (installe les deps du workspace)
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile

### build (ré-installe pour être 100% sûr d’avoir les deps du workspace)
FROM base AS build
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile
COPY . .
# build dans l'ordre: shared -> api
RUN pnpm -r --filter @cg/shared --filter @cg/api build

### runner (cwd = apps/api)
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app/apps/api

# deps pnpm racine + deps locales du package @cg/api
COPY --from=build /app/node_modules           /app/node_modules
COPY --from=build /app/apps/api/node_modules  ./node_modules

# artefacts + workspace shared (cible des symlinks pnpm)
COPY --from=build /app/apps/api/dist          ./dist
COPY --from=build /app/apps/api/scripts       ./scripts
COPY --from=build /app/packages/shared        /app/packages/shared

EXPOSE 4000
CMD ["node","--loader","./scripts/esm-loader.mjs","./dist/main.js"]
