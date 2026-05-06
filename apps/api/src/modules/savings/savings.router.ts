import { Router } from "express";
import rateLimit from "express-rate-limit";

import env from "@/constants/env";
import { createSavingsModule } from "@/modules/savings/savings.container";

const { savingsController, authenticate } = createSavingsModule();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.get("NODE_ENV") === "production" ? 100 : 10000,
});

const savingsRouter = Router()
  .use(limiter)
  .use(authenticate)
  .get("/", savingsController.getAll)
  .get("/:id", savingsController.getById)
  .post("/", savingsController.create)
  .patch("/:id", savingsController.update)
  .delete("/:id", savingsController.remove);

export default savingsRouter;
