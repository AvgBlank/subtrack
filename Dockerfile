# Multi-stage Dockerfile for a Bun monorepo using TurboRepo

# Base image with Bun
FROM oven/bun:1.3.9-alpine AS base

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

# Generate built files
FROM base AS builder
WORKDIR /app
COPY --from=installer /app .
COPY --from=pruner /app/out/full .
# Temporary DB URL for generating prisma types
ARG DATABASE_URL="postgresql://prisma:prisma@localhost:5432/temp"
RUN DATABASE_URL=${DATABASE_URL} bun run build

# Prisma commands
FROM builder AS prisma
WORKDIR /app/apps/api

# Base runner
FROM base AS runner
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
RUN bun install --production --frozen-lockfile

# API Runner
FROM runner AS api-runner
# Shared packages
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/prisma.config.ts ./apps/api/prisma.config.ts

# Start the app
WORKDIR /app/apps/api
CMD ["bun", "run", "start"]

# Web Runner
FROM runner AS web-runner
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/next.config.ts ./apps/web
COPY --from=builder /app/apps/web/public ./apps/web/public

# Start the app
WORKDIR /app/apps/web
CMD ["bun", "run", "start"]

