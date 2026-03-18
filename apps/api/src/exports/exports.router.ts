import { Router } from "express";
import * as exportsController from "@/exports/exports.controller";
import authenticate from "@/shared/middleware/authMiddleware";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

const exportsRouter = Router()
  .use(limiter)
  .use(authenticate)
  .post("/", exportsController.exportData);

export default exportsRouter;
