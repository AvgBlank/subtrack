import { Router } from "express";
import rateLimit from "express-rate-limit";

import { NODE_ENV } from "@/shared/constants/env";
import authenticate from "@/shared/middleware/authMiddleware";
import * as summaryController from "@/summary/summary.controller";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === "production" ? 100 : 10000,
});

const summaryRouter = Router()
  .use(limiter)
  .use(authenticate)
  .get("/", summaryController.monthlySummary)
  .get("/recurring", summaryController.recurringSummary)
  .get("/income", summaryController.incomeSummary)
  .get("/one-time", summaryController.oneTimeSummary)
  .get("/cash-flow", summaryController.cashFlowSummary)
  .get("/savings", summaryController.savingsSummary)
  .get("/can-i-spend", summaryController.canISpend);

export default summaryRouter;
