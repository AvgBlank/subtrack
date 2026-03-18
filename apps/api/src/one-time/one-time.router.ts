import { Router } from "express";
import * as oneTimeController from "@/one-time/one-time.controller";
import authenticate from "@/shared/middleware/authMiddleware";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

const oneTimeRouter = Router()
  .use(limiter)
  .use(authenticate)
  .get("/", oneTimeController.getByMonth)
  .get("/:id", oneTimeController.getById)
  .post("/", oneTimeController.create)
  .patch("/:id", oneTimeController.update)
  .delete("/:id", oneTimeController.remove);

export default oneTimeRouter;
