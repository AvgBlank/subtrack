import { CREATED } from "@subtrack/shared/httpStatusCodes";
import { headerSchema, registerSchema } from "@subtrack/shared/schemas/auth";
import type { Request, Response } from "express";

import AuthService from "@/modules/auth/auth.service";
import { setAuthCookie } from "@/utils/cookies";

const getHeader = (req: Request, headerName: string): string | undefined => {
  const headerValue = req.headers[headerName.toLowerCase()];
  if (Array.isArray(headerValue)) {
    return headerValue[0];
  }
  return headerValue;
};

class AuthController {
  public constructor(private authService: AuthService) {}

  public register = async (req: Request, res: Response) => {
    // Validate request body and headers
    const { name, email, password } = registerSchema.parse(req.body);
    const { "user-agent": userAgent } = headerSchema.parse(req.headers);

    const ip =
      getHeader(req, "cf-connecting-ip") ||
      getHeader(req, "x-real-ip") ||
      getHeader(req, "x-forwarded-for") ||
      req.socket.remoteAddress ||
      undefined;

    // Handle registration
    const { user, refreshToken, accessToken } =
      await this.authService.handleRegister(
        name,
        email,
        password,
        ip,
        userAgent,
      );

    // Set cookies & send response
    setAuthCookie(res, refreshToken);
    return res
      .status(CREATED)
      .json({ message: "Registered successfully", user, accessToken });
  };
}

export default AuthController;
