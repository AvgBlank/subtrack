import { Router } from "express";
import * as incomeController from "@/income/income.controller";
import authenticate from "@/shared/middleware/authMiddleware";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
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
