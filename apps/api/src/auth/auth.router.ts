import { Router } from "express";
import * as authControllers from "@/auth/auth.controller";
import authenticate from "@/shared/middleware/authMiddleware";
import rateLimit from "express-rate-limit";
import { NODE_ENV } from "@/shared/constants/env";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === "production" ? 20 : 10000,
});

const authRouter = Router()
  .use(limiter)
  .post("/register", authControllers.register)
  .post("/login", authControllers.login)
  .post("/google", authControllers.googleOAuth)
  .get("/refresh", authControllers.refresh)
  .get("/verify", authenticate, authControllers.verify)
  .delete("/logout", authControllers.logout);

export default authRouter;
