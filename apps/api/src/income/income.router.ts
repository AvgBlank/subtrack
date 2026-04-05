import { Router } from "express";
import rateLimit from "express-rate-limit";

import * as incomeController from "@/income/income.controller";
import { NODE_ENV } from "@/shared/constants/env";
import authenticate from "@/shared/middleware/authMiddleware";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === "production" ? 100 : 10000,
});

const incomeRouter = Router()
  .use(limiter)
  .use(authenticate)
  .get("/", incomeController.getAll)
  .get("/:id", incomeController.getById)
  .post("/", incomeController.create)
  .patch("/:id", incomeController.update)
  .patch("/:id/toggle", incomeController.toggleStatus)
  .delete("/:id", incomeController.remove);

export default incomeRouter;
