import { Router } from "express";
import * as summaryController from "@/summary/summary.controller";
import authenticate from "@/shared/middleware/authMiddleware";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
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
