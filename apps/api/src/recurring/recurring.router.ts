import { Router } from "express";
import rateLimit from "express-rate-limit";

import * as recurringController from "@/recurring/recurring.controller";
import { NODE_ENV } from "@/shared/constants/env";
import authenticate from "@/shared/middleware/authMiddleware";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === "production" ? 100 : 10000,
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
