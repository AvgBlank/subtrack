import { Router } from "express";
import * as authControllers from "@/auth/auth.controller";
import authenticate from "@/shared/middleware/authMiddleware";

const authRouter = Router()
  .post("/register", authControllers.register)
  .post("/login", authControllers.login)
  .post("/google", authControllers.googleOAuth)
  .get("/verify", authenticate, authControllers.verify)
  .delete("/logout", authControllers.logout);

export default authRouter;
