import app from "@/app";
import { PORT } from "@/shared/constants/env";
import appLogger from "@subtrack/shared/logging";
import prisma from "@/shared/lib/db";

// Make sure database is connected before starting the server
async function connectPrismaWithRetry() {
  let dbReady = 0;
  let retries = 0;
  while (!dbReady) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      appLogger({ message: "Successfully connected to the database" });
      dbReady = 1;
    } catch {
      retries++;
      appLogger({
        message: `Database connection failed. Retrying... (Attempt ${retries})`,
        level: "warn",
      });
      if (retries > 10) {
        appLogger({
          message:
            "Exceeded maximum retry attempts for database connection. Exiting.",
          level: "error",
        });
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}
await connectPrismaWithRetry();

app.listen(PORT, () => {
  appLogger({
    message: `Server is running on http://localhost:${PORT}`,
  });
});
