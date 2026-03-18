import { describe, it, expect, mock, beforeEach } from "bun:test";
import { setAuthCookie, deleteAuthCookie } from "../cookies";
import { thirtyDays } from "../../constants/dates";
import { Response } from "express";

describe("Cookie Utilities", () => {
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockRes = {
      cookie: mock(),
      clearCookie: mock(),
    };
  });

  describe("setAuthCookie", () => {
    it("should set the cookie when refresh token is provided", () => {
      setAuthCookie(mockRes as Response, "my-refresh-token");
      expect(mockRes.cookie).toHaveBeenCalled();

      const callArgs = (mockRes.cookie as any).mock.calls[0];
      expect(callArgs[0]).toBe("refreshToken");
      expect(callArgs[1]).toBe("my-refresh-token");
      expect(callArgs[2].httpOnly).toBe(true);
      expect(callArgs[2].path).toBe("/api/auth/refresh");
      expect(callArgs[2].maxAge).toBe(thirtyDays());
      expect(callArgs[2].expires).toBeInstanceOf(Date);
      // Depending on NODE_ENV, basic types should be present
    });

    it("should not set the cookie when refresh token is null", () => {
      setAuthCookie(mockRes as Response, null);
      expect(mockRes.cookie).not.toHaveBeenCalled();
    });
  });

  describe("deleteAuthCookie", () => {
    it("should clear the cookie", () => {
      deleteAuthCookie(mockRes as Response);
      expect(mockRes.clearCookie).toHaveBeenCalled();

      const callArgs = (mockRes.clearCookie as any).mock.calls[0];
      expect(callArgs[0]).toBe("refreshToken");
      expect(callArgs[1].path).toBe("/api/auth/refresh");
    });
  });
});
