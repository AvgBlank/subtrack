import type { RequestHandler } from "express";
import {
  authSchema,
  headerSchema,
  loginSchema,
  oAuthSchema,
  registerSchema,
} from "@subtrack/shared/schemas/auth";
import * as authServices from "@/auth/auth.services";
import { deleteAuthCookie, setAuthCookie } from "@/shared/utils/cookies";
import { CREATED, UNAUTHORIZED } from "@subtrack/shared/httpStatusCodes";
import AppError, { AppErrorCode } from "@/shared/utils/AppError";

export const register: RequestHandler = async (req, res) => {
  // Validate request body and headers
  const { name, email, password } = registerSchema.parse(req.body);
  const { "user-agent": userAgent } = headerSchema.parse(req.headers);

  // Handle registration
  const { user, refreshToken, accessToken } = await authServices.handleRegister(
    name,
    email,
    password,
    req,
    userAgent,
  );

  // Set cookies & send response
  setAuthCookie(res, refreshToken);
  return res
    .status(CREATED)
    .json({ message: "Registered successfully", user, accessToken });
};

export const login: RequestHandler = async (req, res) => {
  // Validate request body and headers
  const { email, password } = loginSchema.parse(req.body);
  const { "user-agent": userAgent } = headerSchema.parse(req.headers);

  // Handle login
  const { user, refreshToken, accessToken } = await authServices.handleLogin(
    email,
    password,
    req,
    userAgent,
  );

  // Set cookies & send response
  setAuthCookie(res, refreshToken);
  return res.json({ message: "Login successful", user, accessToken });
};

export const googleOAuth: RequestHandler = async (req, res) => {
  // Validate code
  const { code } = oAuthSchema.parse(req.body);
  const { "user-agent": userAgent } = headerSchema.parse(req.headers);

  // Handle Google OAuth
  const { user, refreshToken, accessToken } =
    await authServices.handleGoogleOAuth(code, req, userAgent);

  // Set cookies & send response
  setAuthCookie(res, refreshToken);
  return res.json({ message: "Login successful", user, accessToken });
};

export const refresh: RequestHandler = async (req, res) => {
  // Fetch refresh token from cookies
  const refreshToken = req.cookies["refreshToken"];
  if (!refreshToken) {
    throw new AppError(
      UNAUTHORIZED,
      "Missing refresh token",
      AppErrorCode.AuthError,
    );
  }

  // Handle token refresh
  const { user, newRefreshToken, accessToken } =
    await authServices.handleRefresh(refreshToken);

  // Set cookies & send response
  setAuthCookie(res, newRefreshToken);
  return res.json({
    message: "Token refreshed successfully",
    user,
    accessToken,
  });
};

export const verify: RequestHandler = async (req, res) => {
  // Return success because auth middleware
  return res.json({ user: req.user! });
};

export const logout: RequestHandler = async (req, res) => {
  // Fetch auth token
  const { authorization } = authSchema.parse(req.headers);

  // Handle logout (invalidate session)
  await authServices.handleLogout(authorization);

  // Delete cookies & send response
  deleteAuthCookie(res);
  return res.json({ message: "Logged out successfully" });
};
