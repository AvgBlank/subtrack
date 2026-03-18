import { Router } from "express";
import * as authControllers from "@/auth/auth.controller";
import authenticate from "@/shared/middleware/authMiddleware";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 100 requests per windowMs
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
