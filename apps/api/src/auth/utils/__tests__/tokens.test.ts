import { describe, it, expect } from "bun:test";
import {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
} from "../tokens";

// JWTs take a fraction of a millisecond to sign, so testing the real implementation is fast.

describe("Token Utilities", () => {
  const payload = {
    userId: "test-user-id",
    sessionId: "test-session-id",
  };

  describe("generateAccessToken & verifyAccessToken", () => {
    it("should generate a valid access token that can be verified", async () => {
      const token = await generateAccessToken(payload);
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);

      const verified = await verifyAccessToken(token);
      expect(verified).not.toBeNull();
      if (verified) {
        expect(verified.userId).toBe(payload.userId);
        expect(verified.sessionId).toBe(payload.sessionId);
        expect(verified.exp).toBeGreaterThan(Date.now() / 1000);
      }
    });

    it("should return null on invalid token", async () => {
      const verified = await verifyAccessToken("invalid.token.string");
      expect(verified).toBeNull();
    });
  });

  describe("generateRefreshToken & verifyRefreshToken", () => {
    it("should generate a valid refresh token that can be verified", async () => {
      const token = await generateRefreshToken(payload);
      expect(typeof token).toBe("string");

      const verified = await verifyRefreshToken(token);
      expect(verified).not.toBeNull();
      if (verified) {
        expect(verified.userId).toBe(payload.userId);
        expect(verified.sessionId).toBe(payload.sessionId);
      }
    });

    it("should return null on invalid token", async () => {
      const verified = await verifyRefreshToken("invalid.token.string");
      expect(verified).toBeNull();
    });
  });

  describe("generateTokens", () => {
    it("should generate both access and refresh tokens", async () => {
      const tokens = await generateTokens(payload);
      expect(tokens).toHaveProperty("accessToken");
      expect(tokens).toHaveProperty("refreshToken");
      expect(typeof tokens.accessToken).toBe("string");
      expect(typeof tokens.refreshToken).toBe("string");
    });
  });
});
