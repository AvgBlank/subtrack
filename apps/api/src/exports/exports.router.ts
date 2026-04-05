import { Router } from "express";
import rateLimit from "express-rate-limit";

import * as exportsController from "@/exports/exports.controller";
import { NODE_ENV } from "@/shared/constants/env";
import authenticate from "@/shared/middleware/authMiddleware";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === "production" ? 100 : 10000,
});

const exportsRouter = Router()
  .use(limiter)
  .use(authenticate)
  .post("/", exportsController.exportData);

export default exportsRouter;
