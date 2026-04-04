import { Router } from "express";
import * as authControllers from "@/auth/auth.controller";
import authenticate from "@/shared/middleware/authMiddleware";
import rateLimit from "express-rate-limit";
import { NODE_ENV } from "@/shared/constants/env";
import AuthController from "@/modules/auth/auth.controller";
import AuthService from "@/modules/auth/auth.service";
import { Argon2HashService } from "@/modules/auth/services/hash.service";
import { SessionService } from "@/modules/auth/services/session.service";
import { JoseTokenService } from "@/modules/auth/services/token.service";
import { PrismaUserRepository } from "@/modules/user/user.repository";
import { PrismaSessionRepository } from "@/modules/auth/repositories/session.repository";

// Repositories
const userRepository = new PrismaUserRepository();
const sessionRepository = new PrismaSessionRepository();

// Services
const hashService = new Argon2HashService();
const sessionService = new SessionService(sessionRepository);
const tokenService = new JoseTokenService();

const authService = new AuthService(
  userRepository,
  hashService,
  sessionService,
  tokenService,
);

// Controller
const authController = new AuthController(authService);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === "production" ? 20 : 10000,
});

const authRouter = Router()
  .use(limiter)
  .post("/register", authController.register)
  .post("/login", authControllers.login)
  .post("/google", authControllers.googleOAuth)
  .get("/refresh", authControllers.refresh)
  .get("/verify", authenticate, authControllers.verify)
  .delete("/logout", authControllers.logout);

export default authRouter;
