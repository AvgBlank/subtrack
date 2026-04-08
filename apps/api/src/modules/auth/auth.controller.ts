import { CREATED } from "@subtrack/shared/httpStatusCodes";
import {
  authSchema,
  headerSchema,
  loginSchema,
  oAuthSchema,
  registerSchema,
} from "@subtrack/shared/schemas/auth";
import type { Request, RequestHandler } from "express";

import { IAuthService } from "@/modules/auth/auth.service";
import { deleteAuthCookie, setAuthCookie } from "@/utils/cookies";

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

  public register: RequestHandler = async (req, res) => {
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

  public login: RequestHandler = async (req, res) => {
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

  public googleOAuth: RequestHandler = async (req, res) => {
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

  public refresh: RequestHandler = async (req, res) => {
    // Fetch refresh token from cookies
    const refreshToken = req.cookies["refreshToken"];

    // Handle token refresh
    const { user, newRefreshToken, accessToken } =
      await this.authService.handleRefresh(refreshToken);

    // Set cookies & send response
    setAuthCookie(res, newRefreshToken);
    return res.json({
      message: "Token refreshed successfully",
      user,
      accessToken,
    });
  };

  public verify: RequestHandler = async (req, res) => {
    // Return success because auth middleware
    return res.json({ user: req.user! });
  };

  public logout: RequestHandler = async (req, res) => {
    // Fetch auth token
    const { authorization } = authSchema.parse(req.headers);

    // Handle logout (invalidate session)
    await this.authService.handleLogout(authorization);

    // Delete cookies & send response
    deleteAuthCookie(res);
    return res.json({ message: "Logged out successfully" });
  };
}

export default AuthController;
