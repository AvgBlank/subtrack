import env from "@/constants/env";
import { AuthMiddleware } from "@/middleware/auth.middleware";
import { AuthGuardService } from "@/middleware/services/auth-guard.service";
import AuthController from "@/modules/auth/auth.controller";
import AuthService from "@/modules/auth/auth.service";
import { PrismaSessionRepository } from "@/modules/auth/repositories/session.repository";
import { UaParserDeviceService } from "@/modules/auth/services/device.service";
import { GoogleOAuthService } from "@/modules/auth/services/google.service";
import { Argon2HashService } from "@/modules/auth/services/hash.service";
import { IpApiNetworkService } from "@/modules/auth/services/network.service";
import { SessionService } from "@/modules/auth/services/session.service";
import { JoseTokenService } from "@/modules/auth/services/token.service";
import { PrismaUserRepository } from "@/modules/user/user.repository";

export function createAuthModule() {
  const userRepository = new PrismaUserRepository();
  const sessionRepository = new PrismaSessionRepository();

  const hashService = new Argon2HashService();
  const tokenService = new JoseTokenService(
    env.get("REFRESH_TOKEN_SECRET"),
    env.get("ACCESS_TOKEN_SECRET"),
  );

  const googleOAuthService = new GoogleOAuthService(
    env.get("GOOGLE_CLIENT_ID"),
    env.get("GOOGLE_CLIENT_SECRET"),
    env.get("GOOGLE_REDIRECT_URI"),
  );

  const networkService = new IpApiNetworkService();
  const deviceService = new UaParserDeviceService();

  const sessionService = new SessionService(
    sessionRepository,
    networkService,
    deviceService,
  );

  const authService = new AuthService(
    userRepository,
    sessionRepository,
    hashService,
    sessionService,
    tokenService,
    googleOAuthService,
  );

  const authGuardService = new AuthGuardService(
    tokenService,
    sessionRepository,
  );

  const authController = new AuthController(authService);

  const authMiddleware = new AuthMiddleware(authGuardService);
  const authenticate = authMiddleware.authenticate;

  return {
    authController,
    authenticate,
  };
}
