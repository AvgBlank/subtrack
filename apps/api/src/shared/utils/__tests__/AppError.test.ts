import { describe, it, expect } from "bun:test";
import AppError, { AppErrorCode } from "../AppError";

describe("AppError", () => {
  it("should create an error with statusCode, message, and default errorCode", () => {
    const error = new AppError(400, "Bad Request Message");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Bad Request Message");
    expect(error.errorCode).toBeUndefined();
  });

  it("should accept a custom errorCode", () => {
    const error = new AppError(
      401,
      "Unauthorized access",
      AppErrorCode.AuthError,
    );
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe("Unauthorized access");
    expect(error.errorCode).toBe(AppErrorCode.AuthError);
  });
});
