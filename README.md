# Subtrack

Subtrack is a comprehensive full-stack Subscription & Financial Tracker application built with modern web technologies. It allows you to track recurring expenses, manage your income, log one-time transactions, and set robust savings goals with cashflow forecasting.

## Architecture & Tech Stack

Subtrack uses a modern monorepo setup powered by **TurboRepo** and **Bun**.

### Apps

- **`api`**: Express.js REST API with Prisma ORM (PostgreSQL) and Zod validation. Handles authentication (JWT & Google OAuth), business logic, and database operations.
- **`web`**: Next.js 16 (App Router) frontend utilizing React, TailwindCSS, Radix UI (Shadcn), and React Query for state management.

### Packages

- **`shared`**: Common Zod validation schemas and utility types shared seamlessly between the backend and frontend.
- **`eslint-config`**: Shared ESLint configuration tailored for Next.js, TypeScript, and Prettier.
- **`typescript-config`**: Shared strict `tsconfig.json` bases.

### Testing & CI/CD

- **Unit/Integration**: Handled natively by `bun:test` across both `api` and `shared` layers.
- **E2E**: Playwright tests configured for the frontend workflows.
- **CI/CD**: GitHub Actions workflows run CI on pushes (`.github/workflows/ci.yml`) and deploy to AWS EC2 via SSH (`.github/workflows/deploy.yml`).

---

## Setup & Local Development

This project uses an idempotent setup script for easy onboarding.

### Prerequisites

- Recommended: [Bun](https://bun.sh/)
- Docker & Docker Compose (for local Postgres via Compose)

### Quick Start

1. **Clone the repository.**
2. **Run Initialization Script:**
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```
   _This script securely installs dependencies, generates the Prisma client, sets up local `.env` files, and bootstraps the PostgreSQL database using Docker._
3. **Start Development Servers:**
   ```bash
   bun run dev
   ```
   _The API will be available at `http://localhost:3000` (or `8000` depending on your env setup) and the Web App at `http://localhost:3000` or `3001`._

---

## Design Decisions

- **Bun**: Chosen as the primary JavaScript runtime and package manager due to its unmatched speed for installation, script execution, and its built-in lightning-fast test runner (`bun:test`).
- **Prisma & Postgres**: Prisma provides strict, auto-generated TypeScript types reflecting our database schema, solving the exactness problem across backend boundary layers.
- **TurboRepo**: Orchestrates build caching and seamless monorepo task sharing (linting, testing).
- **Zod (Shared Package)**: Input validation schemas are defined once in the `shared` package, and consumed by both React Hook Form on the frontend and Express middleware on the backend to guarantee DRY and robust validation constraints.
- **Service-Oriented Architecture**: The API strictly isolates Route Handlers -> Services -> Prisma DB access. This allows componentized and deeply mockable unit testing.

## Deployment Strategy

Deployment is automated using **Docker Compose** alongside GitHub Actions.

1. The `deploy.yml` GitHub workflow listens for pushes to the `main` branch.
2. It SSHes into the designated EC2 instance using secrets (`EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`).
3. Executes `scripts/deploy.sh` which natively handles Git pulling, Docker building, Prisma migrations (`migrate deploy`), and container restarting.

Ensure your EC2 instance has Docker, Docker Compose, and Git installed, and the AWS security groups expose the required ports (e.g., ports `80`/`443` mapped via NGinx to your Compose ports).
