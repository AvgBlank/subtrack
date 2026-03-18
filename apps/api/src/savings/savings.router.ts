import { Router } from "express";
import * as savingsController from "@/savings/savings.controller";
import authenticate from "@/shared/middleware/authMiddleware";
import rateLimit from "express-rate-limit";
import { NODE_ENV } from "@/shared/constants/env";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === "production" ? 100 : 10000,
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
