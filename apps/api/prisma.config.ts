import { defineConfig, env } from "prisma/config";
import { config } from "dotenv";
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "bun run dist/prisma/seed.js",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
