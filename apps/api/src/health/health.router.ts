import { Router } from "express";

const healthRouter = Router()
  .get("/", (_req, res) => {
    res.json({ status: "Healthy" });
  })
  .get("/health", (_req, res) => {
    res.json({ status: "Healthy" });
  });

export default healthRouter;
