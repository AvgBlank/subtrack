import { Router } from "express";

import exportsRouter from "@/exports/exports.router";
import healthRouter from "@/health/health.router";
import incomeRouter from "@/income/income.router";
import authRouter from "@/modules/auth/auth.router";
import oneTimeRouter from "@/one-time/one-time.router";
import recurringRouter from "@/recurring/recurring.router";
import savingsRouter from "@/savings/savings.router";
import summaryRouter from "@/summary/summary.router";

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
