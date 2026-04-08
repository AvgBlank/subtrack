import { UNAUTHORIZED } from "@subtrack/shared/httpStatusCodes";
import { authSchema } from "@subtrack/shared/schemas/auth";
import { RequestHandler } from "express";

import AppError, { AppErrorCode } from "@/utils/AppError";

import { IAuthGuardService } from "./services/auth-guard.service";

export class AuthMiddleware {
  public constructor(private authGuardService: IAuthGuardService) {}

  public authenticate: RequestHandler = async (req, _res, next) => {
    // Validate Authorization header
    const { authorization } = authSchema.parse(req.headers);
    if (!authorization) {
      throw new AppError(
        UNAUTHORIZED,
        "Missing access token",
        AppErrorCode.InvalidAccessToken,
      );
    }
    const [type, token] = authorization.split(" ");
    if (type !== "Bearer" || !token) {
      throw new AppError(
        UNAUTHORIZED,
        "Invalid access token format",
        AppErrorCode.InvalidAccessToken,
      );
    }

    // Authenticate user and session using AuthGuardService
    const { user, session } = await this.authGuardService.authenticate(token);

    // Attach user and session to request object
    req.user = user;
    req.session = session;

    next();
  };
}
