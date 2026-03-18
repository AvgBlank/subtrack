import { describe, it, expect, mock, beforeEach } from "bun:test";
import errorHandler from "../errorHandler";
import AppError, { AppErrorCode } from "../../utils/AppError";
import { ZodError, ZodIssue } from "zod";
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
} from "@subtrack/shared/httpStatusCodes";
import { Request, Response } from "express";

describe("errorHandler Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: any;
  let statusMock: any;
  let jsonMock: any;
  let clearCookieMock: any;

  beforeEach(() => {
    jsonMock = mock();
    statusMock = mock(() => ({ json: jsonMock }));
    clearCookieMock = mock();

    mockReq = { path: "/test" };
    mockRes = {
      status: statusMock,
      clearCookie: clearCookieMock,
    };
    mockNext = mock();
  });

  it("should handle ZodError correctly", () => {
    const issues: ZodIssue[] = [
      { path: ["email"], message: "Invalid email", code: "custom" },
    ];
    const error = new ZodError(issues);

    errorHandler(
      error as any,
      mockReq as Request,
      mockRes as Response,
      mockNext,
    );

    expect(statusMock).toHaveBeenCalledWith(BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalledWith({
      error: error.flatten().fieldErrors,
    });
  });

  it("should handle AppError correctly", () => {
    const error = new AppError(404, "Not Found Error");

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "Not Found Error",
      errorCode: undefined,
    });
    expect(clearCookieMock).not.toHaveBeenCalled();
  });

  it("should handle AppError with AuthError and clear cookies", () => {
    const error = new AppError(401, "Token expired", AppErrorCode.AuthError);

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "Token expired",
      errorCode: AppErrorCode.AuthError,
    });
    expect(clearCookieMock).toHaveBeenCalledWith(
      "refreshToken",
      expect.anything(),
    );
  });

  it("should handle generic errors", () => {
    const error = new Error("Something broke!");

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "Internal server error",
    });
  });
});
