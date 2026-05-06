import { Router } from "express";

import healthRouter from "@/health/health.router";
import authRouter from "@/modules/auth/auth.router";
import exportsRouter from "@/modules/exports/exports.router";
import incomeRouter from "@/modules/income/income.router";
import oneTimeRouter from "@/modules/one-time/one-time.router";
import recurringRouter from "@/modules/recurring/recurring.router";
import savingsRouter from "@/modules/savings/savings.router";
import summaryRouter from "@/modules/summary/summary.router";

const router = Router()
  .use("/", healthRouter)
  .use("/api/auth", authRouter)
  .use("/api/summary", summaryRouter)
  .use("/api/recurring", recurringRouter)
  .use("/api/income", incomeRouter)
  .use("/api/one-time", oneTimeRouter)
  .use("/api/savings", savingsRouter)
  .use("/api/exports", exportsRouter);

export default router;
