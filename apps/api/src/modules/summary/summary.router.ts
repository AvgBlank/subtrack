import { Router } from "express";
import rateLimit from "express-rate-limit";

import env from "@/constants/env";
import { createSummaryModule } from "@/modules/summary/summary.container";

const { summaryController, authenticate } = createSummaryModule();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.get("NODE_ENV") === "production" ? 100 : 10000,
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
