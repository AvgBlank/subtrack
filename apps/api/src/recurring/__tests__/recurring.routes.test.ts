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
import { Decimal } from "@prisma/client/runtime/client";

describe("Recurring Router Integration", () => {
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
    (prisma.session.findUnique as any).mockClear();
    (prisma.session.update as any).mockClear();
    (prisma.recurringTransactions.findMany as any).mockClear();
    (prisma.recurringTransactions.findFirst as any).mockClear();
    (prisma.recurringTransactions.create as any).mockClear();
    (prisma.recurringTransactions.update as any).mockClear();
    (prisma.recurringTransactions.delete as any).mockClear();

    // Mock successful auth
    (prisma.session.findUnique as any).mockResolvedValue({
      id: "test-session-id",
      userId: "test-user-id",
      user: { id: "test-user-id" },
      expiresAt: new Date(Date.now() + 1000000),
    });
  });

  it("GET /api/recurring should return all recurring items", async () => {
    (prisma.recurringTransactions.findMany as any).mockResolvedValue([
      {
        id: "1",
        userId: "test-user-id",
        name: "Sub",
        amount: new Decimal(10),
        category: "Subscriptions",
        frequency: "MONTHLY",
        type: "SUBSCRIPTION",
        startDate: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const res = await fetch(`${url}/api/recurring`, { headers: authHeaders });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.length).toBe(1);
    expect(data[0].normalizedAmount).toBe(10);
  });

  it("POST /api/recurring should create item", async () => {
    (prisma.recurringTransactions.create as any).mockResolvedValue({
      id: "1",
      userId: "test-user-id",
      name: "Sub",
      amount: new Decimal(15),
      category: "Subscriptions",
      frequency: "MONTHLY",
      type: "SUBSCRIPTION",
      startDate: new Date(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await fetch(`${url}/api/recurring`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Netflix",
        amount: 15,
        type: "SUBSCRIPTION",
        category: "Entertainment",
        frequency: "MONTHLY",
        startDate: new Date(),
      }),
    });

    expect(res.status).toBe(201);
  });

  it("PATCH /api/recurring/:id should update item", async () => {
    (prisma.recurringTransactions.findFirst as any).mockResolvedValue({
      id: "1",
      userId: "test-user-id",
      name: "Sub",
      amount: new Decimal(15),
      category: "Subscriptions",
      frequency: "MONTHLY",
      type: "SUBSCRIPTION",
      startDate: new Date(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    (prisma.recurringTransactions.update as any).mockResolvedValue({
      id: "1",
      userId: "test-user-id",
      name: "Sub",
      amount: new Decimal(20),
      category: "Subscriptions",
      frequency: "MONTHLY",
      type: "SUBSCRIPTION",
      startDate: new Date(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await fetch(`${url}/api/recurring/1`, {
      method: "PATCH",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 20 }),
    });

    expect(res.status).toBe(200);
  });

  it("DELETE /api/recurring/:id should delete item", async () => {
    (prisma.recurringTransactions.findFirst as any).mockResolvedValue({
      id: "1",
      userId: "test-user-id",
    });

    const res = await fetch(`${url}/api/recurring/1`, {
      method: "DELETE",
      headers: authHeaders,
    });

    expect(res.status).toBe(200);
    expect(prisma.recurringTransactions.delete).toHaveBeenCalled();
  });

  it("should block unauthenticated requests", async () => {
    const res = await fetch(`${url}/api/recurring`);
    expect(res.status).toBe(401);
  });
});
