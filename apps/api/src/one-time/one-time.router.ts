import { Router } from "express";
import * as oneTimeController from "@/one-time/one-time.controller";
import authenticate from "@/shared/middleware/authMiddleware";

const oneTimeRouter = Router()
  .use(authenticate)
  .get("/", oneTimeController.getByMonth)
  .get("/:id", oneTimeController.getById)
  .post("/", oneTimeController.create)
  .patch("/:id", oneTimeController.update)
  .delete("/:id", oneTimeController.remove);

export default oneTimeRouter;
