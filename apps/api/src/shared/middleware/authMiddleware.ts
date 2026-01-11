import AppError, { AppErrorCode } from "@/shared/utils/AppError";
import { UNAUTHORIZED } from "@subtrack/shared/httpStatusCodes";
import { verifyRefreshToken } from "@/auth/utils/tokens";
import { RequestHandler } from "express";
import prisma from "@/shared/lib/db";

const authenticate: RequestHandler = async (req, _res, next) => {
  // Check for refresh token in cookies
  const refreshToken = req.cookies["refreshToken"];
  if (!refreshToken) {
    throw new AppError(
      UNAUTHORIZED,
      "Missing refresh token",
      AppErrorCode.AuthError,
    );
  }

  // Validate refresh token
  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) {
    throw new AppError(
      UNAUTHORIZED,
      "Invalid refresh token",
      AppErrorCode.AuthError,
    );
  }

  // Fetch user details
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });
  if (!user) {
    throw new AppError(UNAUTHORIZED, "User not found", AppErrorCode.AuthError);
  }
  req.user = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  next();
};
export default authenticate;
