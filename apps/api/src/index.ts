import app from "@/app";
import { PORT } from "@/shared/constants/env";
import appLogger from "@subtrack/shared/logging";
import prisma from "@/shared/lib/db";

// Make sure database is connected before starting the server
async function connectPrismaWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      appLogger({ message: "Successfully connected to the database" });
      return;
    } catch {
      appLogger({
        message: `DB not ready, retrying (${i + 1}/${maxRetries})...`,
        level: "warn",
      });
    }
  }
  appLogger({
    message: "Failed to connect to the database after multiple attempts",
    level: "error",
  });
  process.exit(1);
}
await connectPrismaWithRetry();

app.listen(PORT, () => {
  appLogger({
    message: `Server is running on http://localhost:${PORT}`,
  });
});
