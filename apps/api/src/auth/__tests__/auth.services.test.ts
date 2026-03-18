import { describe, it, expect, beforeEach } from "bun:test";
import prisma from "../../shared/lib/db";
import * as authServices from "../auth.services";

describe("Auth Services", () => {
  const req: any = { headers: {}, socket: { remoteAddress: "127.0.0.1" } };

  beforeEach(() => {
    (prisma.user.findUnique as any).mockClear();
    (prisma.user.create as any).mockClear();
    (prisma.session.create as any).mockResolvedValue({ id: "test-session-id" });
  });

  describe("handleRegister", () => {
    it("should create user and return tokens when email is unique", async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue({
        id: "user-id",
        email: "test@example.com",
        name: "Test",
      });

      const payload = {
        name: "Test",
        email: "test@example.com",
        password: "Password1!",
      };
      const result = await authServices.handleRegister(
        payload.name,
        payload.email,
        payload.password,
        req,
      );

      expect(prisma.user.create).toHaveBeenCalled();
      expect(typeof result.accessToken).toBe("string");
      expect(result.user.name).toBe("Test");
    });

    it("should throw CONFLICT if email exists", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: "existing" });
      const payload = {
        name: "Test",
        email: "existing@example.com",
        password: "Password1!",
      };

      try {
        await authServices.handleRegister(
          payload.name,
          payload.email,
          payload.password,
          req,
        );
        expect(false).toBe(true); // Should not reach here
      } catch (err: any) {
        expect(err.statusCode).toBe(409);
      }
    });
  });

  describe("handleLogin", () => {
    it("should return tokens for valid login", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-id",
        password: "hashed-password",
      });

      const result = await authServices.handleLogin(
        "test@example.com",
        "Password1!",
        req,
      );
      expect(typeof result.accessToken).toBe("string");
    });

    it("should throw UNAUTHORIZED for wrong password", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-id",
        password: "hashed-password",
      });

      try {
        await authServices.handleLogin("test", "wrong", req);
        expect(false).toBe(true);
      } catch (err: any) {
        expect(err.statusCode).toBe(401);
      }
    });

    it("should throw for OAuth users attempting password login", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: "user-id" }); // no password

      try {
        await authServices.handleLogin("test", "pwd", req);
        expect(false).toBe(true);
      } catch (err: any) {
        expect(err.statusCode).toBe(401);
      }
    });
  });
});
