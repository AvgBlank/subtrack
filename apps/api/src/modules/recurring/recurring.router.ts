import { Router } from "express";
import rateLimit from "express-rate-limit";

import env from "@/constants/env";
import { createRecurringModule } from "@/modules/recurring/recurring.container";

const { recurringController, authenticate } = createRecurringModule();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.get("NODE_ENV") === "production" ? 100 : 10000,
});

const recurringRouter = Router()
  .use(limiter)
  .use(authenticate)
  .get("/", recurringController.getAll)
  .get("/:id", recurringController.getById)
  .post("/", recurringController.create)
  .patch("/:id", recurringController.update)
  .patch("/:id/toggle", recurringController.toggleStatus)
  .delete("/:id", recurringController.remove);

export default recurringRouter;
