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

describe("Savings Router Integration", () => {
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
    (prisma.session.findFirst as any).mockClear();
    (prisma.savingsGoal.findMany as any).mockClear();
    (prisma.savingsGoal.findFirst as any).mockClear();
    (prisma.savingsGoal.create as any).mockClear();
    (prisma.savingsGoal.update as any).mockClear();
    (prisma.savingsGoal.delete as any).mockClear();

    (prisma.session.findFirst as any).mockResolvedValue({
      id: "test-session-id",
      userId: "test-user-id",
      user: { id: "test-user-id" },
      expiresAt: new Date(Date.now() + 1000000),
    });
  });

  it("GET /api/savings should return progress calculations", async () => {
    (prisma.savingsGoal.findMany as any).mockResolvedValue([
      {
        id: "1",
        userId: "test-user-id",
        name: "Car",
        targetAmount: new Decimal(20000),
        currentAmount: new Decimal(10000),
        targetDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        ),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const res = await fetch(`${url}/api/savings`, { headers: authHeaders });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data[0].progressPercentage).toBe(50);
    expect(data[0].status).toBeDefined();
  });

  it("POST /api/savings should create goal", async () => {
    (prisma.savingsGoal.create as any).mockResolvedValue({
      id: "1",
      userId: "test-user-id",
      name: "Car",
      targetAmount: new Decimal(20000),
      currentAmount: new Decimal(0),
      targetDate: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1),
      ),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await fetch(`${url}/api/savings`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Car",
        targetAmount: 20000,
        currentAmount: 0,
        targetDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        ),
      }),
    });
    expect(res.status).toBe(201);
  });

  it("PATCH /api/savings/:id should update focus goal", async () => {
    (prisma.savingsGoal.findFirst as any).mockResolvedValue({
      id: "1",
      userId: "test-user-id",
      name: "Car",
      targetAmount: new Decimal(20000),
      currentAmount: new Decimal(0),
      targetDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    (prisma.savingsGoal.update as any).mockResolvedValue({
      id: "1",
      userId: "test-user-id",
      name: "Car",
      targetAmount: new Decimal(20000),
      currentAmount: new Decimal(5000),
      targetDate: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1),
      ),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await fetch(`${url}/api/savings/1`, {
      method: "PATCH",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ currentAmount: 5000 }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.progressPercentage).toBe(25);
  });

  it("DELETE /api/savings/:id should delete", async () => {
    (prisma.savingsGoal.findFirst as any).mockResolvedValue({
      id: "1",
      userId: "test-user-id",
    });

    const res = await fetch(`${url}/api/savings/1`, {
      method: "DELETE",
      headers: authHeaders,
    });
    expect(res.status).toBe(200);
  });
});
