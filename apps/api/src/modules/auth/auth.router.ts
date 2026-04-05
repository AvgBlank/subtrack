import { Router } from "express";
import rateLimit from "express-rate-limit";

import * as authControllers from "@/auth/auth.controller";
import env from "@/constants/env";
import authenticate from "@/middleware/authMiddleware";
import AuthController from "@/modules/auth/auth.controller";
import AuthService from "@/modules/auth/auth.service";
import { PrismaSessionRepository } from "@/modules/auth/repositories/session.repository";
import { UaParserDeviceService } from "@/modules/auth/services/device.service";
import { Argon2HashService } from "@/modules/auth/services/hash.service";
import { IpApiNetworkService } from "@/modules/auth/services/network.service";
import { SessionService } from "@/modules/auth/services/session.service";
import { JoseTokenService } from "@/modules/auth/services/token.service";
import { PrismaUserRepository } from "@/modules/user/user.repository";

// Repositories
const userRepository = new PrismaUserRepository();
const sessionRepository = new PrismaSessionRepository();

// Services
const networkService = new IpApiNetworkService();
const deviceService = new UaParserDeviceService();
const hashService = new Argon2HashService();
const sessionService = new SessionService(
  sessionRepository,
  networkService,
  deviceService,
);
const tokenService = new JoseTokenService(
  env.get("REFRESH_TOKEN_SECRET"),
  env.get("ACCESS_TOKEN_SECRET"),
);

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
  max: env.get("NODE_ENV") === "production" ? 20 : 10000,
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
