import { describe, it, expect } from "bun:test";
import {
  registerSchema,
  loginSchema,
  oAuthSchema,
  authSchema,
  headerSchema,
} from "../auth";

describe("Auth Schemas", () => {
  describe("registerSchema", () => {
    it("should validate correct data", () => {
      const data = {
        name: "Test User",
        email: "test@example.com",
        password: "Valid1Password!",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should fail on missing name", () => {
      const data = { email: "test@example.com", password: "Valid1Password!" };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Name must be a string");
      }
    });

    it("should fail on invalid email", () => {
      const data = {
        name: "Test User",
        email: "invalid",
        password: "Valid1Password!",
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid email address");
      }
    });

    it("should fail on weak passwords", () => {
      const weakPasswords = [
        "short", // too short
        "alllowercase!", // no uppercase
        "ALLUPPERCASE!", // no lowercase
        "NoSpecialChar123", // no special char
        "NoNumber!!!", // no number
      ];

      for (const password of weakPasswords) {
        const data = { name: "Test User", email: "test@example.com", password };
        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
      }
    });
  });

  describe("loginSchema", () => {
    it("should validate correct data", () => {
      const data = { email: "test@example.com", password: "Password1!" };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should fail on missing fields", () => {
      expect(loginSchema.safeParse({ email: "test@example.com" }).success).toBe(
        false,
      );
      expect(loginSchema.safeParse({ password: "Password1!" }).success).toBe(
        false,
      );
    });
  });

  describe("oAuthSchema", () => {
    it("should validate code string", () => {
      expect(oAuthSchema.safeParse({ code: "auth_code" }).success).toBe(true);
      expect(oAuthSchema.safeParse({ code: "" }).success).toBe(false);
    });
  });

  describe("headerSchema and authSchema", () => {
    it("should extract authorization from headers", () => {
      const headers = { authorization: "Bearer token123", other: "value" };
      const result = authSchema.safeParse(headers);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.authorization).toBe("Bearer token123");
      }
    });

    it("should make authorization optional in headerSchema", () => {
      const headers = { other: "value" };
      const result = headerSchema.safeParse(headers);
      expect(result.success).toBe(true);
    });

    it("should allow missing authorization if schema makes it optional", () => {
      const result = authSchema.safeParse({ authorization: "Bearer tokens" });
      expect(result.success).toBe(true);
      expect(authSchema.safeParse({}).success).toBe(true);
    });
  });
});
