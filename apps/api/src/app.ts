import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { APP_ORIGIN } from "@/shared/constants/env";
import authRouter from "@/auth/auth.router";
import errorHandler from "@/shared/middleware/errorHandler";

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

// Error Handler
app.use(errorHandler);

export default app;
