import type { RequestHandler } from "express";
import {
  loginSchema,
  oAuthSchema,
  registerSchema,
} from "@subtrack/shared/schemas/auth";
import * as authServices from "@/auth/auth.services";
import { deleteAuthCookie, setAuthCookie } from "@/shared/utils/cookies";
import { CREATED } from "@subtrack/shared/httpStatusCodes";

export const register: RequestHandler = async (req, res) => {
  // Validate request body
  const { name, email, password } = registerSchema.parse(req.body);

  // Handle registration
  const { user, refreshToken } = await authServices.handleRegister(
    name,
    email,
    password,
  );

  // Set cookies & send response
  setAuthCookie(res, refreshToken);
  return res.status(CREATED).json({ message: "Registered successfully", user });
};

export const login: RequestHandler = async (req, res) => {
  // Validate request body
  const { email, password } = loginSchema.parse(req.body);

  // Handle login
  const { user, refreshToken } = await authServices.handleLogin(
    email,
    password,
  );

  // Set cookies & send response
  setAuthCookie(res, refreshToken);
  return res.json({ message: "Login successful", user });
};

export const googleOAuth: RequestHandler = async (req, res) => {
  // Validate code
  const { code } = oAuthSchema.parse(req.body);

  // Handle Google OAuth
  const { user, refreshToken } = await authServices.handleGoogleOAuth(code);

  // Set cookies & send response
  setAuthCookie(res, refreshToken);
  return res.json({ message: "Login successful", user });
};

export const verify: RequestHandler = async (req, res) => {
  // Return success because auth middleware
  return res.json({ user: req.user! });
};

export const logout: RequestHandler = async (_req, res) => {
  // Delete cookies & send response
  deleteAuthCookie(res);
  return res.json({ message: "Logged out successfully" });
};
