import { Router } from "express";
import rateLimit from "express-rate-limit";

import env from "@/constants/env";
import { createAuthModule } from "@/modules/auth/auth.container";

const { authController, authenticate } = createAuthModule();

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: env.get("NODE_ENV") === "production" ? 40 : 10000,
  message: {
    error: "Too many requests, please try again later.",
  },
  skipSuccessfulRequests: true,
});

const authRouter = Router()
  .use(limiter)
  .post("/register", authController.register)
  .post("/login", authController.login)
  .post("/google", authController.googleOAuth)
  .get("/refresh", authController.refresh)
  .get("/verify", authenticate, authController.verify)
  .delete("/logout", authController.logout);

export default authRouter;
