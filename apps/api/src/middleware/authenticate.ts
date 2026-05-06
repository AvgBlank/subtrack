import type { RequestHandler } from "express";

import env from "@/constants/env";
import { PrismaSessionRepository } from "@/modules/auth/repositories/session.repository";
import { JoseTokenService } from "@/modules/auth/services/token.service";
import { AuthGuardService } from "@/middleware/services/auth-guard.service";
import { AuthMiddleware } from "@/middleware/auth.middleware";

/**
 * Factory that wires the minimal auth dependency graph and returns a
 * ready-to-use `authenticate` RequestHandler for protecting routes.
 *
 * Each module container calls this to get its own authenticate instance.
 */
export function createAuthenticate(): RequestHandler {
  const sessionRepository = new PrismaSessionRepository();
  const tokenService = new JoseTokenService(
    env.get("REFRESH_TOKEN_SECRET"),
    env.get("ACCESS_TOKEN_SECRET"),
  );
  const authGuardService = new AuthGuardService(tokenService, sessionRepository);
  return new AuthMiddleware(authGuardService).authenticate;
}
