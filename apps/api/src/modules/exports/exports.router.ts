import { Router } from "express";
import rateLimit from "express-rate-limit";

import env from "@/constants/env";
import { createExportsModule } from "@/modules/exports/exports.container";

const { exportController, authenticate } = createExportsModule();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.get("NODE_ENV") === "production" ? 100 : 10000,
});

const exportsRouter = Router()
  .use(limiter)
  .use(authenticate)
  .post("/", exportController.exportData);

export default exportsRouter;
