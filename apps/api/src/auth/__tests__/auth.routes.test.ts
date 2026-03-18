import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "bun:test";
import {
  createTestServer,
  MOCK_VALID_TOKEN,
} from "../../__tests__/helpers/setup";
import prisma from "../../shared/lib/db";

describe("Auth Router Integration", () => {
  let server: any;
  let url: string;

  beforeAll(async () => {
    const testServer = await createTestServer();
    server = testServer.server;
    url = testServer.url;
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    (prisma.user.findUnique as any).mockClear();
    (prisma.user.create as any).mockClear();
    (prisma.session.findUnique as any).mockClear();
    (prisma.session.create as any).mockClear();
    (prisma.session.delete as any).mockClear();
  });

  describe("POST /api/auth/register", () => {
    it("should register user and return tokens", async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue({
        id: "user-id",
        email: "new@example.com",
        name: "New User",
      });
      (prisma.session.create as any).mockResolvedValue({ id: "session-id" });

      const response = await fetch(`${url}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "New User",
          email: "new@example.com",
          password: "Password1!",
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.user).toBeDefined();
      expect(data.user.name).toBe("New User");
      expect(response.headers.get("set-cookie")).toContain("refreshToken=");
    });

    it("should return 400 for validation error", async () => {
      const response = await fetch(`${url}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invalid: "data" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login user with correct password", async () => {
      // Mock bcrypt through require cache for integration test is tricky.
      // We will rely purely on the fact that if findUnique finds a user, the bcrypt mock in the token service might not trigger since it runs in the original worker.
      // Wait, let's mock bcrypt globally if needed, but integration tests testing the real route handler could just bypass password check by mocking the service or doing what we did in `setup.ts`.
      const hash = "$argon2id$v=19$m=65536,t=3,p=4$dummy$dummy";

      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-id",
        email: "test@example.com",
        password: hash,
      });
      (prisma.session.create as any).mockResolvedValue({ id: "session-id" });

      const response = await fetch(`${url}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "Password1!",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.user).toBeDefined();
    });

    it("should reject wrong password", async () => {
      const hash = "$argon2id$v=19$m=65536,t=3,p=4$dummy$dummy";
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-id",
        email: "test@example.com",
        password: hash,
      });

      const response = await fetch(`${url}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "wrongpwd",
        }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/auth/verify", () => {
    it("should verify successfully", async () => {
      (prisma.session.findUnique as any).mockResolvedValue({
        id: "test-session-id",
        user: { id: "test-user-id", name: "Valid", email: "valid@ex.com" },
        expiresAt: new Date(Date.now() + 1000000), // future
      });

      const response = await fetch(`${url}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${MOCK_VALID_TOKEN}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.user.name).toBe("Valid");
    });

    it("should return 401 without token", async () => {
      const response = await fetch(`${url}/api/auth/verify`);
      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /api/auth/logout", () => {
    it("should logout successfully", async () => {
      (prisma.session.findUnique as any).mockResolvedValue({
        id: "test-session-id",
        user: { id: "test-user-id" },
        expiresAt: new Date(Date.now() + 1000000),
      });

      const response = await fetch(`${url}/api/auth/logout`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${MOCK_VALID_TOKEN}` },
      });

      expect(response.status).toBe(200);
      expect(prisma.session.deleteMany).toHaveBeenCalled();
    });
  });
});
