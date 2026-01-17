import AppError, { AppErrorCode } from "@/shared/utils/AppError";
import { UNAUTHORIZED } from "@subtrack/shared/httpStatusCodes";
import { RequestHandler } from "express";
import prisma from "@/shared/lib/db";
import { authSchema } from "@subtrack/shared/schemas/auth";
import { verifyAccessToken } from "@/auth/utils/tokens";

const authenticate: RequestHandler = async (req, _res, next) => {
  // Validate Authorization header
  const { authorization } = authSchema.parse(req.headers);
  if (!authorization) {
    throw new AppError(
      UNAUTHORIZED,
      "Missing access token",
      AppErrorCode.InvalidAccessToken,
    );
  }
  const auth = authorization.split(" ");
  if (auth.length !== 2 || auth[0] !== "Bearer") {
    throw new AppError(
      UNAUTHORIZED,
      "Invalid access token format",
      AppErrorCode.InvalidAccessToken,
    );
  }

  // Verify access token
  const payload = await verifyAccessToken(auth[1]);
  if (!payload) {
    throw new AppError(
      UNAUTHORIZED,
      "Invalid access token",
      AppErrorCode.InvalidAccessToken,
    );
  }

  // Check user and session
  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    include: { user: true },
  });
  if (!session || !session.user) {
    throw new AppError(UNAUTHORIZED, "Invalid Session", AppErrorCode.AuthError);
  }

  // Validate session
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.deleteMany({
      where: { id: session.id },
    });
    throw new AppError(UNAUTHORIZED, "Session expired", AppErrorCode.AuthError);
  }

  // Update last active at
  await prisma.session.update({
    where: { id: session.id },
    data: { lastActiveAt: new Date() },
  });

  // Attach user and session to request object
  req.user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    picture: session.user.picture,
  };
  req.session = {
    id: session.id,
    userId: session.userId,
    userAgent: session.userAgent,
    expiresAt: session.expiresAt,
  };

  next();
};
export default authenticate;
