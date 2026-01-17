import prisma from "@/shared/lib/db";
import AppError, { AppErrorCode } from "@/shared/utils/AppError";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
} from "@subtrack/shared/httpStatusCodes";
import { verify, hash } from "argon2";
import {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/auth/utils/tokens";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} from "@/shared/constants/env";
import createSession from "@/auth/utils/createSession";
import { Request } from "express";
import appLogger from "@subtrack/shared/logging";
import { thirtyDaysFromNow, twentyFourHours } from "@/shared/constants/dates";

export const handleRegister = async (
  name: string,
  email: string,
  password: string,
  req: Request,
  userAgent?: string,
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
      picture: true,
    },
  });

  // Create session
  const session = await createSession(user.id, userAgent, req);

  // Generate tokens (access & refresh)
  const payload = {
    userId: user.id,
    sessionId: session.id,
  };
  const { refreshToken, accessToken } = await generateTokens(payload);
  return { user, refreshToken, accessToken };
};

export const handleLogin = async (
  email: string,
  password: string,
  req: Request,
  userAgent?: string,
) => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      picture: true,
    },
  });
  if (!user) throw new AppError(UNAUTHORIZED, "Invalid email or password");

  // Check for OAuth users
  if (!user.password)
    throw new AppError(
      UNAUTHORIZED,
      "Please log in using google and then set a password",
    );

  // Validate Password
  const passwordValid = await verify(user.password, password);
  if (!passwordValid)
    throw new AppError(UNAUTHORIZED, "Invalid email or password");

  // Create session
  const session = await createSession(user.id, userAgent, req);

  // Generate tokens (access & refresh)
  const payload = {
    userId: user.id,
    sessionId: session.id,
  };
  const { refreshToken, accessToken } = await generateTokens(payload);
  return {
    refreshToken,
    accessToken,
    user: {
      ...user,
      password: undefined,
    },
  };
};

export const handleGoogleOAuth = async (
  code: string,
  req: Request,
  userAgent?: string,
) => {
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
  const { email, name, picture } = (await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${access_token}` },
    },
  ).then((res) => res.json())) as {
    email?: string;
    name?: string;
    picture?: string;
  };
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
      picture: true,
    },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: name ?? "Unknown User",
        email,
        password: null,
        picture,
      },
      select: {
        id: true,
        name: true,
        email: true,
        picture: true,
      },
    });
  }
  if (user && !user.picture && picture) {
    user = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        picture,
      },
    });
  }

  // Create session
  const session = await createSession(user.id, userAgent, req);

  // Generate tokens (access & refresh)
  const payload = {
    userId: user.id,
    sessionId: session.id,
  };
  const { refreshToken, accessToken } = await generateTokens(payload);
  return { user, refreshToken, accessToken };
};

export const handleRefresh = async (refreshToken: string) => {
  // Validate refresh token
  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) {
    throw new AppError(
      UNAUTHORIZED,
      "Invalid refresh token",
      AppErrorCode.AuthError,
    );
  }

  // Validate session
  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId, expiresAt: { gt: new Date() } },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          picture: true,
        },
      },
    },
  });
  if (!session) {
    await prisma.session.deleteMany({
      where: { id: payload.sessionId },
    });
    throw new AppError(UNAUTHORIZED, "Session expired", AppErrorCode.AuthError);
  }

  // Refresh session if it expires in the next 24 hours
  const sessionNeedsRefresh =
    session.expiresAt.getTime() - Date.now() <= twentyFourHours();
  if (sessionNeedsRefresh) {
    await prisma.session.update({
      where: { id: session.id },
      data: { expiresAt: thirtyDaysFromNow() },
    });
  }

  // Update last active at
  await prisma.session.update({
    where: { id: session.id },
    data: { lastActiveAt: new Date() },
  });

  // Generate new tokens
  const newPayload = {
    userId: session.user.id,
    sessionId: session.id,
  };
  const newRefreshToken = sessionNeedsRefresh
    ? await generateRefreshToken(newPayload)
    : null;
  const accessToken = await generateAccessToken(newPayload);

  return { user: session.user, newRefreshToken, accessToken };
};

export const handleLogout = async (authHeader?: string) => {
  // If authorized invalidate session
  if (authHeader) {
    const auth = authHeader.split(" ");
    if (auth.length == 2 && auth[0] === "Bearer") {
      const token = auth[1];
      const payload = await verifyAccessToken(token);
      if (!payload) {
        appLogger({
          message: "Failed to verify access token during logout",
        });
      } else {
        await prisma.session.deleteMany({
          where: { id: payload.sessionId },
        });
      }
    }
  }
};
