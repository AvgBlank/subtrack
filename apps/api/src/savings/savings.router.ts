import { Router } from "express";
import * as savingsController from "@/savings/savings.controller";
import authenticate from "@/shared/middleware/authMiddleware";

const savingsRouter = Router()
  .use(authenticate)
  .get("/", savingsController.getAll)
  .get("/:id", savingsController.getById)
  .post("/", savingsController.create)
  .patch("/:id", savingsController.update)
  .delete("/:id", savingsController.remove);

export default savingsRouter;
