import { Response, ErrorRequestHandler } from "express";

import { z } from "zod";

import AppError, { AppErrorCode } from "@/shared/utils/AppError";
import { deleteAuthCookie } from "@/shared/utils/cookies";

import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
} from "@subtrack/shared/httpStatusCodes";
import appLogger from "@subtrack/shared/logging";

const handleZodError = (res: Response, err: z.ZodError) => {
  const error = {
    ...z.flattenError(err).fieldErrors,
    ...z.flattenError(err).formErrors,
  };
  return res.status(BAD_REQUEST).json({ error });
};

const handleAppError = (res: Response, err: AppError) => {
  if (err.errorCode == AppErrorCode.AuthError) {
    deleteAuthCookie(res);
  }

  return res
    .status(err.statusCode)
    .json({ error: err.message, errorCode: err.errorCode });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof z.ZodError) {
    appLogger({
      message: `ZodError - PATH: ${req.path}`,
      err: z.flattenError(err).fieldErrors,
      level: "info",
    });
    return handleZodError(res, err);
  }

  if (err instanceof AppError) {
    if (err.statusCode === INTERNAL_SERVER_ERROR) {
      appLogger({
        message: `PATH: ${req.path}`,
        err: err,
        level: "error",
      });
    }
    return handleAppError(res, err);
  }

  appLogger({
    message: `PATH: ${req.path}`,
    err: err,
    level: "error",
  });

  return res
    .status(INTERNAL_SERVER_ERROR)
    .json({ error: "Internal server error" });
};

export default errorHandler;
