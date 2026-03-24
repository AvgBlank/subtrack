# Bun image
FROM oven/bun:1.3.9-alpine AS base

# Prune using TurboRepo
FROM base AS pruner
WORKDIR /app
RUN bun install -g turbo@2.8.19
COPY . .
RUN turbo prune @subtrack/web --docker

# Install Dependencies & generate build files
FROM base AS builder
WORKDIR /app
# Install dependencies
COPY --from=pruner /app/out/json/ .
RUN bun install --frozen-lockfile
# Build-Time Environment Variables for Google OAuth
ARG NEXT_PUBLIC_API_URL=""
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_GOOGLE_REDIRECT_URI
ENV NEXT_PUBLIC_GOOGLE_REDIRECT_URI=$NEXT_PUBLIC_GOOGLE_REDIRECT_URI
# Build
COPY --from=pruner /app/out/full .
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
COPY --chown=appuser:appgroup --from=builder /app/apps/web/.next ./apps/web/.next
COPY --chown=appuser:appgroup --from=builder /app/apps/web/next.config.mjs ./apps/web/next.config.mjs
COPY --chown=appuser:appgroup --from=builder /app/apps/web/public ./apps/web/public
# Change user
USER appuser
# Start the app
WORKDIR /app/apps/web
CMD ["bun", "run", "start"]

