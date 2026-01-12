import { Router } from "express";
import * as recurringController from "@/recurring/recurring.controller";
import authenticate from "@/shared/middleware/authMiddleware";

const recurringRouter = Router()
  .use(authenticate)
  .get("/", recurringController.getAll)
  .get("/:id", recurringController.getById)
  .post("/", recurringController.create)
  .patch("/:id", recurringController.update)
  .patch("/:id/toggle", recurringController.toggleStatus)
  .delete("/:id", recurringController.remove);

export default recurringRouter;
