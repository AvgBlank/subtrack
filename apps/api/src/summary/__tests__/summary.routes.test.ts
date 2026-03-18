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

describe("Summary Router Integration", () => {
  let server: any;
  let url: string;

  const authHeaders = {
    Authorization: `Bearer ${MOCK_VALID_TOKEN}`,
  };

  beforeAll(async () => {
    const testServer = await createTestServer();
    server = testServer.server;
    url = testServer.url;
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    (prisma.session.findUnique as any).mockResolvedValue({
      id: "test-session-id",
      userId: "test-user-id",
      user: { id: "test-user-id" },
      expiresAt: new Date(Date.now() + 1000000),
    });
    // Stub the main returns so it doesn't crash
    (prisma.recurringTransactions.findMany as any).mockResolvedValue([]);
    (prisma.income.findMany as any).mockResolvedValue([]);
    (prisma.oneTimeTransaction.findMany as any).mockResolvedValue([]);
    (prisma.savingsGoal.findMany as any).mockResolvedValue([]);
  });

  it("GET /api/summary should return combined monthly summary", async () => {
    const res = await fetch(`${url}/api/summary?month=3&year=2026`, {
      headers: authHeaders,
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.recurring).toBeDefined();
    expect(data.income).toBeDefined();
    expect(data.cashFlow).toBeDefined();
    expect(data.savings).toBeDefined();
  });

  it("GET /api/summary/recurring", async () => {
    const res = await fetch(`${url}/api/summary/recurring`, {
      headers: authHeaders,
    });
    expect(res.status).toBe(200);
  });

  it("GET /api/summary/can-i-spend should return true/false based on cashflow", async () => {
    const res = await fetch(`${url}/api/summary/can-i-spend?amount=50`, {
      headers: authHeaders,
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.canSpend).toBeDefined();
  });
});
