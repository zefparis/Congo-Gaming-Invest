# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.10.0 --activate

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages ./packages

# Install dependencies (only API workspace)
RUN pnpm install --filter @cg/api... --frozen-lockfile

# Build stage
FROM base AS build
COPY apps/api ./apps/api
COPY tsconfig.json ./tsconfig.json
RUN pnpm --filter @cg/api build

# Production image
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@8.10.0 --activate

# Copy workspace manifest
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages ./packages

# Install production dependencies for API
RUN pnpm install --filter @cg/api --prod --frozen-lockfile

# Copy build output
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY apps/api/scripts ./apps/api/scripts

EXPOSE 4000
CMD ["pnpm", "--filter", "@cg/api", "start"]
