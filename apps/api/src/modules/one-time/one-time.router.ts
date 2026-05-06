import { Router } from "express";
import rateLimit from "express-rate-limit";

import env from "@/constants/env";
import { createOneTimeModule } from "@/modules/one-time/one-time.container";

const { oneTimeController, authenticate } = createOneTimeModule();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.get("NODE_ENV") === "production" ? 100 : 10000,
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
