# Bun image
FROM oven/bun:1.3.9-alpine AS base

# Prune using TurboRepo
FROM base AS pruner
WORKDIR /app
RUN bun install -g turbo@2.8.21
COPY . .
RUN turbo prune @subtrack/api --docker

# Install Dependencies & generate build files
FROM base AS builder
WORKDIR /app
# Install dependencies
COPY --from=pruner /app/out/json/ .
RUN bun install --frozen-lockfile
# Build
COPY --from=pruner /app/out/full .
# Temporary DB URL for generating prisma types
ARG DATABASE_URL="postgresql://prisma:prisma@localhost:5432/temp"
RUN bun run build

# Runner
FROM base AS runner
WORKDIR /app
# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# Install production dependencies
COPY --from=pruner /app/out/json/ .
RUN bun install --production --frozen-lockfile
# Copy built files
COPY --chown=appuser:appgroup --from=builder /app/packages/shared ./packages/shared
COPY --chown=appuser:appgroup --from=builder /app/apps/api/dist ./apps/api/dist
COPY --chown=appuser:appgroup --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --chown=appuser:appgroup --from=builder /app/apps/api/prisma.config.ts ./apps/api/prisma.config.ts
# Change user
USER appuser
# Start the app
WORKDIR /app/apps/api
CMD ["bun", "run", "start"]

