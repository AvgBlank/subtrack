import prisma from "@/shared/lib/db";
import AppError from "@/shared/utils/AppError";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
} from "@subtrack/shared/httpStatusCodes";
import { verify, hash } from "argon2";
import { generateRefreshToken } from "@/auth/utils/tokens";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} from "@/shared/constants/env";

export const handleRegister = async (
  name: string,
  email: string,
  password: string,
) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) throw new AppError(CONFLICT, "User already exists");

  // Create user
  const hashedPassword = await hash(password);
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  // Generate refresh tokens
  const payload = {
    userId: user.id,
  };
  const refreshToken = await generateRefreshToken(payload);
  return { user, refreshToken };
};

export const handleLogin = async (email: string, password: string) => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
    },
  });
  if (!user) throw new AppError(UNAUTHORIZED, "Invalid email or password");

  // Check for OAuth users
  if (!user.password)
    throw new AppError(UNAUTHORIZED, "Please log in using google");

  // Validate Password
  const passwordValid = await verify(user.password, password);
  if (!passwordValid)
    throw new AppError(UNAUTHORIZED, "Invalid email or password");

  // Generate refresh token
  const payload = {
    userId: user.id,
  };
  const refreshToken = await generateRefreshToken(payload);
  return {
    refreshToken,
    user: {
      ...user,
      password: undefined,
    },
  };
};

export const handleGoogleOAuth = async (code: string) => {
  // Exchange code for access token
  const { access_token } = (await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: GOOGLE_REDIRECT_URI,
    }),
  }).then((res) => res.json())) as { access_token?: string };
  if (!access_token) {
    throw new AppError(INTERNAL_SERVER_ERROR, "Failed to get access token");
  }

  // Get user info from Google
  const { email, name } = (await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${access_token}` },
    },
  ).then((res) => res.json())) as { email?: string; name?: string };
  if (!email) {
    throw new AppError(UNAUTHORIZED, "No email provided");
  }

  // Check if user exists or create new user
  let user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: name ?? "Unknown User",
        email,
        password: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  // Generate refresh token
  const payload = {
    userId: user.id,
  };
  const refreshToken = await generateRefreshToken(payload);
  return { user, refreshToken };
};
