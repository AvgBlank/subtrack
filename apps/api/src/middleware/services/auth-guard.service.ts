import { UNAUTHORIZED } from "@subtrack/shared/httpStatusCodes";

import { ISessionRepository } from "@/modules/auth/repositories/session.repository";
import { ITokenService } from "@/modules/auth/services/token.service";
import AppError, { AppErrorCode } from "@/utils/AppError";

export interface IAuthGuardService {
  authenticate(accessToken: string): Promise<{
    user: {
      id: string;
      name: string;
      email: string;
      picture: string | null;
    };
    session: {
      id: string;
      userId: string;
      userAgent: string;
      expiresAt: Date;
    };
  }>;
}

export class AuthGuardService implements IAuthGuardService {
  constructor(
    private tokenService: ITokenService,
    private sessionRepository: ISessionRepository,
  ) {}

  async authenticate(accessToken: string) {
    // Verify access token
    const payload = await this.tokenService.verifyAccessToken(accessToken);
    if (!payload) {
      throw new AppError(
        UNAUTHORIZED,
        "Invalid access token",
        AppErrorCode.InvalidAccessToken,
      );
    }

    // Check user and session
    const session = await this.sessionRepository.getActiveSessionById(
      payload.sessionId,
    );
    if (!session || !session.user) {
      throw new AppError(
        UNAUTHORIZED,
        "Invalid session",
        AppErrorCode.AuthError,
      );
    }

    // Validate session
    if (session.expiresAt.getTime() < Date.now()) {
      await this.sessionRepository.deleteSessionById(session.id);
      throw new AppError(
        UNAUTHORIZED,
        "Session expired",
        AppErrorCode.AuthError,
      );
    }

    // Update last active at
    await this.sessionRepository.updateSessionLastActiveAt(session.id);

    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        picture: session.user.picture,
      },
      session: {
        id: session.id,
        userId: session.user.id,
        userAgent: session.userAgent,
        expiresAt: session.expiresAt,
      },
    };
  }
}
