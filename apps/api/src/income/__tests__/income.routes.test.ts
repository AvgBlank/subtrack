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

describe("Income Router Integration", () => {
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
    (prisma.income.findMany as any).mockClear();
    (prisma.income.findFirst as any).mockClear();
    (prisma.income.create as any).mockClear();
    (prisma.income.update as any).mockClear();
    (prisma.income.delete as any).mockClear();

    (prisma.session.findFirst as any).mockResolvedValue({
      id: "test-session-id",
      userId: "test-user-id",
      user: { id: "test-user-id" },
      expiresAt: new Date(Date.now() + 1000000),
    });
  });

  it("GET /api/income should return all income", async () => {
    (prisma.income.findMany as any).mockResolvedValue([
      {
        id: "1",
        userId: "test-user-id",
        source: "Job",
        amount: new Decimal(5000),
        date: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const res = await fetch(`${url}/api/income`, { headers: authHeaders });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.length).toBe(1);
    expect(data[0].source).toBe("Job");
  });

  it("POST /api/income should create item", async () => {
    (prisma.income.create as any).mockResolvedValue({
      id: "1",
      userId: "test-user-id",
      source: "Job",
      amount: new Decimal(5000),
      date: new Date(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await fetch(`${url}/api/income`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ source: "Job", amount: 5000, date: new Date() }),
    });
    expect(res.status).toBe(201);
  });

  it("PATCH /api/income/:id should update item", async () => {
    (prisma.income.findFirst as any).mockResolvedValue({
      id: "1",
      userId: "test-user-id",
      source: "Job",
      amount: new Decimal(5000),
      date: new Date(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    (prisma.income.update as any).mockResolvedValue({
      id: "1",
      userId: "test-user-id",
      source: "Job",
      amount: new Decimal(6000),
      date: new Date(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await fetch(`${url}/api/income/1`, {
      method: "PATCH",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 6000 }),
    });
    expect(res.status).toBe(200);
  });

  it("DELETE /api/income/:id should delete item", async () => {
    (prisma.income.findFirst as any).mockResolvedValue({
      id: "1",
      userId: "test-user-id",
    });

    const res = await fetch(`${url}/api/income/1`, {
      method: "DELETE",
      headers: authHeaders,
    });

    expect(res.status).toBe(200);
    expect(prisma.income.delete).toHaveBeenCalled();
  });
});
