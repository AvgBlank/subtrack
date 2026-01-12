import { Router } from "express";
import * as incomeController from "@/income/income.controller";
import authenticate from "@/shared/middleware/authMiddleware";

const incomeRouter = Router()
  .use(authenticate)
  .get("/", incomeController.getAll)
  .get("/:id", incomeController.getById)
  .post("/", incomeController.create)
  .patch("/:id", incomeController.update)
  .patch("/:id/toggle", incomeController.toggleStatus)
  .delete("/:id", incomeController.remove);

export default incomeRouter;
