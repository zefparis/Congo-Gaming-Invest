# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.10.0 --activate

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY . .
RUN pnpm -r --filter @cg/shared --filter @cg/api build

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.10.0 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/scripts ./apps/api/scripts
COPY --from=build /app/packages/shared ./packages/shared
EXPOSE 4000
CMD ["node", "--loader", "./apps/api/scripts/esm-loader.mjs", "./apps/api/dist/main.js"]
