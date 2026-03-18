import { describe, it, expect, mock, beforeEach } from "bun:test";
import createSession from "../createSession";
import prisma from "../../../shared/lib/db";
import { Request } from "express";

// Mock prisma for this test
mock.module("../../../shared/lib/db", () => ({
  default: {
    session: {
      create: mock((args) =>
        Promise.resolve({
          id: "mock-session-id",
          ...args.data,
        }),
      ),
    },
  },
}));

// Mock fetch for IP lookup
global.fetch = mock(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        status: "success",
        country: "US",
        city: "New York",
        regionName: "NY",
      }),
    ok: true,
  } as any),
) as any;

describe("createSession", () => {
  let req: Partial<Request>;

  beforeEach(() => {
    req = {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
        "cf-connecting-ip": "192.168.1.100",
      },
      socket: {
        remoteAddress: "192.168.1.100",
      } as any,
    };
  });

  it("should parse user agent and mask IP to create a session", async () => {
    const userId = "test-user-id";
    const userAgent = req.headers!["user-agent"] as string;

    const session = await createSession(userId, userAgent, req as Request);

    expect(prisma.session.create).toHaveBeenCalled();
    expect(session.userId).toBe(userId);
    expect(session.browser).toBe("Chrome");
    expect(session.os).toBe("Windows");
    expect(session.ipAddress).toBe("192.168.1.xxx");
    expect(session.location).toBe("New York, NY, US");
    expect(session.expiresAt).toBeInstanceOf(Date);
  });

  it("should handle missing user agent gracefully", async () => {
    const reqNoUA = { ...req, headers: { "cf-connecting-ip": "1.1.1.1" } };
    const session = await createSession("user2", undefined, reqNoUA as Request);

    expect(session.userAgent).toBe("Unknown");
    expect(session.browser).toBe("Unknown");
    expect(session.os).toBe("Unknown");
    expect(session.ipAddress).toBe("1.1.1.xxx");
  });
});
