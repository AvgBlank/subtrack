import HttpStatusCode from "@subtrack/shared/httpStatusCodes";

export const enum AppErrorCode {
  InvalidAccessToken = "InvalidAccessToken",
  AuthError = "AuthError",
}

class AppError extends Error {
  constructor(
    public statusCode: HttpStatusCode,
    public message: string,
    public errorCode?: AppErrorCode,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export default AppError;
