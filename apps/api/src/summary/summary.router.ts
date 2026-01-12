import { Router } from "express";
import * as summaryController from "@/summary/summary.controller";
import authenticate from "@/shared/middleware/authMiddleware";

const summaryRouter = Router()
  .use(authenticate)
  .get("/", summaryController.monthlySummary)
  .get("/recurring", summaryController.recurringSummary)
  .get("/income", summaryController.incomeSummary)
  .get("/one-time", summaryController.oneTimeSummary)
  .get("/cash-flow", summaryController.cashFlowSummary)
  .get("/savings", summaryController.savingsSummary)
  .get("/can-i-spend", summaryController.canISpend);

export default summaryRouter;
