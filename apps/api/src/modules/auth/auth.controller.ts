import { CREATED } from "@subtrack/shared/httpStatusCodes";
import {
  headerSchema,
  loginSchema,
  oAuthSchema,
  registerSchema,
} from "@subtrack/shared/schemas/auth";
import type { Request, Response } from "express";

import { IAuthService } from "@/modules/auth/auth.service";
import { setAuthCookie } from "@/utils/cookies";

class AuthController {
  public constructor(private authService: IAuthService) {}

  private getHeader = (
    req: Request,
    headerName: string,
  ): string | undefined => {
    const headerValue = req.headers[headerName.toLowerCase()];
    if (Array.isArray(headerValue)) {
      return headerValue[0];
    }
    return headerValue;
  };

  private getClientIp = (req: Request): string | undefined => {
    return (
      this.getHeader(req, "cf-connecting-ip") ||
      this.getHeader(req, "x-real-ip") ||
      this.getHeader(req, "x-forwarded-for") ||
      req.socket.remoteAddress ||
      undefined
    );
  };

  public register = async (req: Request, res: Response) => {
    // Validate request body and headers
    const { name, email, password } = registerSchema.parse(req.body);
    const { "user-agent": userAgent } = headerSchema.parse(req.headers);

    // Handle registration
    const { user, refreshToken, accessToken } =
      await this.authService.handleRegister({
        name,
        email,
        password,
        ip: this.getClientIp(req),
        userAgent,
      });

    // Set cookies & send response
    setAuthCookie(res, refreshToken);
    return res
      .status(CREATED)
      .json({ message: "Registered successfully", user, accessToken });
  };

  public login = async (req: Request, res: Response) => {
    // Validate request body and headers
    const { email, password } = loginSchema.parse(req.body);
    const { "user-agent": userAgent } = headerSchema.parse(req.headers);

    // Handle login
    const { user, refreshToken, accessToken } =
      await this.authService.handleLogin({
        email,
        password,
        ip: this.getClientIp(req),
        userAgent,
      });

    // Set cookies & send response
    setAuthCookie(res, refreshToken);
    return res.json({ message: "Login successful", user, accessToken });
  };

  public googleOAuth = async (req: Request, res: Response) => {
    // Validate code
    const { code } = oAuthSchema.parse(req.body);
    const { "user-agent": userAgent } = headerSchema.parse(req.headers);

    // Handle Google OAuth
    const { user, refreshToken, accessToken } =
      await this.authService.handleGoogleOAuth({
        code,
        ip: this.getClientIp(req),
        userAgent,
      });

    // Set cookies & send response
    setAuthCookie(res, refreshToken);
    return res.json({ message: "Login successful", user, accessToken });
  };
}

export default AuthController;
