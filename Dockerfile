# Multi-stage Dockerfile for a Bun monorepo using TurboRepo

# Base image with Bun
FROM oven/bun:1 AS base

# Prune using TurboRepo
FROM base AS pruner
WORKDIR /app
RUN bun install -g turbo@2.7.4
COPY . .
RUN turbo prune @subtrack/api @subtrack/web --docker

# Install dependencies
FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock .
COPY --from=pruner /app/out/full/turbo.json .
RUN bun install --frozen-lockfile

# Run build
FROM base AS builder
WORKDIR /app
COPY --from=installer /app .
COPY --from=pruner /app/out/full .
# Temporary DB URL for generating prisma types
ARG DATABASE_URL="postgresql://prisma:prisma@localhost:5432/temp"
ENV DATABASE_URL=$DATABASE_URL
RUN bun run build

# API Runner
FROM base AS api-runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
# Shared packages
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
# Actual built files
COPY --from=builder /app/apps/api/dist ./apps/api/dist
# Copy Prisma files for migrations
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/prisma.config.ts ./apps/api/prisma.config.ts

# Start the app
WORKDIR /app/apps/api
CMD ["bun", "start"]

# Web Runner
FROM base AS web-runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
# Shared packages
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
# Actual built files
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# Start the app
WORKDIR /app/apps/web
CMD ["bun", "server.js"]

