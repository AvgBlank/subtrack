import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { APP_ORIGIN } from "@/shared/constants/env";
import errorHandler from "@/shared/middleware/errorHandler";
import authRouter from "@/auth/auth.router";
import summaryRouter from "@/summary/summary.router";
import recurringRouter from "@/recurring/recurring.router";
import incomeRouter from "@/income/income.router";
import oneTimeRouter from "@/one-time/one-time.router";
import savingsRouter from "@/savings/savings.router";

const app = express();

// Configure Express
app.use(
  cors({
    origin: APP_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/", (_req, res) => {
  res.json("Hello, World!");
});
app.use("/api/auth", authRouter);
app.use("/api/summary", summaryRouter);
app.use("/api/recurring", recurringRouter);
app.use("/api/income", incomeRouter);
app.use("/api/one-time", oneTimeRouter);
app.use("/api/savings", savingsRouter);

// Error Handler
app.use(errorHandler);

export default app;
