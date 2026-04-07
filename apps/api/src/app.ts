import appLogger from "@subtrack/shared/logging";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { EnvService } from "@/constants/env";
import errorHandler from "@/middleware/errorHandler";

export type Route = {
  path: string;
  router: express.Router;
};

class App {
  private app: express.Application;
  private config: EnvService;

  constructor(routes: Route[], config: EnvService) {
    this.config = config;

    this.app = express();
    this.setupMiddleware();
    this.setupRoutes(routes);
    this.setupErrorHandling();
  }

  private setupMiddleware() {
    this.app.use(
      cors({
        origin: this.config.get("APP_ORIGIN"),
        credentials: true,
      }),
    );
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.set("trust proxy", 1);
  }

  private setupRoutes(routes: Route[]) {
    routes.forEach((route) => this.app.use(route.path, route.router));
  }

  private setupErrorHandling() {
    this.app.use(errorHandler);
  }

  public startServer() {
    const port = this.config.get("PORT");
    this.app.listen(port, () => {
      appLogger({
        message: `Server is running on http://localhost:${port}`,
        level: "info",
      });
    });
  }
}
export default App;
