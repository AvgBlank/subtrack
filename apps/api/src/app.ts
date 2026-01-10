import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { APP_ORIGIN } from "@/constants/env";

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

app.get("/", (_req, res) => {
  res.json("Hello, World!");
});

export default app;
