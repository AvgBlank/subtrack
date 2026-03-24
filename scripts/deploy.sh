#!/bin/bash
set -e

echo "🚀 Starting Deployment Process..."

missing=()

[ -z "$APP_ORIGIN" ] && missing+=("APP_ORIGIN")
[ -z "$DATABASE_URL" ] && missing+=("DATABASE_URL")
[ -z "$ACCESS_TOKEN_SECRET" ] && missing+=("ACCESS_TOKEN_SECRET")
[ -z "$REFRESH_TOKEN_SECRET" ] && missing+=("REFRESH_TOKEN_SECRET")
[ -z "$GOOGLE_CLIENT_ID" ] && missing+=("GOOGLE_CLIENT_ID")
[ -z "$GOOGLE_CLIENT_SECRET" ] && missing+=("GOOGLE_CLIENT_SECRET")
[ -z "$GOOGLE_REDIRECT_URI" ] && missing+=("GOOGLE_REDIRECT_URI")

if [ ${#missing[@]} -ne 0 ]; then
  echo "Missing required environment variables:"
  for var in "${missing[@]}"; do
    echo "  - $var"
  done
  exit 1
fi

echo "📦 Pulling latest images..."
docker compose pull

echo "🗄️ Running database + services..."
docker compose -f compose.prod.yml --profile localdb up -d --wait db
docker compose -f compose.prod.yml --profile migrate run --rm migrate
docker compose -f compose.prod.yml up -d --no-deps --wait api
docker compose -f compose.prod.yml up -d --no-deps web
docker compose -f compose.prod.yml up -d --no-deps traefik

echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment completed successfully!"
