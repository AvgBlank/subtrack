#!/bin/bash
# scripts/deploy.sh
# Idempotent script for production deployment (typically to an EC2 instance)

set -e

echo "🚀 Starting Deployment Process..."

# 2. Check for required env files in api and web
if [ ! -f "apps/api/.env" ] || [ ! -f "apps/web/.env" ]; then
  echo "❌ Missing .env file. Deployment halted."
  exit 1
fi

# 3. Build containers
echo "🏗️  Building Docker Containers..."
# Uses the docker-compose file which handles building API and WEB images
docker compose --profile localdb --profile migrate build

# 4. Migrate database
echo "🗄️  Running Database Migrations..."
# Start the postgres service first if not already running
docker compose up -d db migrate

echo "⏳ Waiting for migrations to be applied..."
sleep 3

# 5. Restart services with zero-ish downtime
echo "🔄 Restarting Services..."
# Recreate only changed containers
docker compose up -d --no-deps db api web

echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment completed successfully! 🎉"
