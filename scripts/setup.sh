#!/bin/bash
# scripts/setup.sh
# Idempotent script to setup the Subtrack development environment

set -e

echo "🚀 Starting Subtrack Setup..."

# Check for Bun
if ! command -v bun >/dev/null 2>&1; then
    echo "⚠️  Bun is not installed. Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
    echo "✅ Bun installed."
else
    echo "✅ Bun detected: $(bun -v)"
fi

echo "📦 Installing Dependencies..."
bun install --frozen-lockfile

echo "🔄 Generating Prisma Client..."
bun run db:generate -- --ui=stream-with-experimental-timestamps

echo "🔨 Building the project..."
bun run build -- --ui=stream-with-experimental-timestamps

# Create .env files if they don't exist
if [ ! -f apps/api/.env ]; then
    echo "⚠️  Creating api .env from example..."
    cp apps/api/.env.sample apps/api/.env
    echo "✅ Created .env"
fi

if [ ! -f apps/web/.env ]; then
    echo "⚠️  Creating web .env from example..."
    cp apps/web/.env.sample apps/web/.env
    echo "✅ Created .env"
fi

echo "🐳 Database setup..."
if command -v docker-compose &> /dev/null; then
  echo "✅ Found docker-compose, starting DB..."
  docker-compose --profile migrate --profile seed up -d db migrate seed
else
  echo "⚠️ docker-compose not found. Skipping automated database setup."
  echo "👉 Please ensure your DATABASE_URL in apps/api/.env points to a valid Postgres database."
  echo "👉 Then run: bun db:migrate:deploy"
fi

echo "🎉 Setup Complete! Run 'bun run dev' to start local development servers."
echo "🎉 Setup Complete! Run 'bun run start' to start production servers."
