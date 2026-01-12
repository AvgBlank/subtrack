import { Router } from "express";
import * as summaryController from "@/summary/summary.controller";
import authenticate from "@/shared/middleware/authMiddleware";

const summaryRouter = Router()
  .use(authenticate)
  .get("/recurring", summaryController.recurringSummary);
export default summaryRouter;
