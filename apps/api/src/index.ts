import App from "@/app";
import env from "@/constants/env";
import { verifyDBConnection } from "@/lib/prisma";
import router from "@/modules";

async function main() {
  await verifyDBConnection();
  const app = new App(
    [
      {
        path: "/",
        router,
      },
    ],
    env,
  );
  app.startServer();
}

main();
