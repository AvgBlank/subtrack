import { Router } from "express";
import rateLimit from "express-rate-limit";

import env from "@/constants/env";
import { createIncomeModule } from "@/modules/income/income.container";

const { incomeController, authenticate } = createIncomeModule();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.get("NODE_ENV") === "production" ? 100 : 10000,
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
