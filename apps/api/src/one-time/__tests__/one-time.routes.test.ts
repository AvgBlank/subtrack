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

describe("One-Time Router Integration", () => {
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
    (prisma.oneTimeTransaction.findMany as any).mockClear();
    (prisma.oneTimeTransaction.findFirst as any).mockClear();
    (prisma.oneTimeTransaction.create as any).mockClear();
    (prisma.oneTimeTransaction.update as any).mockClear();
    (prisma.oneTimeTransaction.delete as any).mockClear();

    (prisma.session.findFirst as any).mockResolvedValue({
      id: "test-session-id",
      userId: "test-user-id",
      user: { id: "test-user-id" },
      expiresAt: new Date(Date.now() + 1000000),
    });
  });

  it("GET /api/one-time should optionally filter by month and year", async () => {
    (prisma.oneTimeTransaction.findMany as any).mockResolvedValue([
      {
        id: "1",
        userId: "test-user-id",
        name: "Coffee",
        amount: new Decimal(5),
        category: "Food",
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const res = await fetch(`${url}/api/one-time?month=3&year=2026`, {
      headers: authHeaders,
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.length).toBe(1);
    expect(prisma.oneTimeTransaction.findMany).toHaveBeenCalled();
  });

  it("GET /api/one-time should return 400 on bad query params", async () => {
    const res = await fetch(`${url}/api/one-time?month=13`, {
      headers: authHeaders,
    });
    expect(res.status).toBe(400); // Because month is > 12
  });

  it("POST /api/one-time should create transaction", async () => {
    (prisma.oneTimeTransaction.create as any).mockResolvedValue({
      id: "1",
      userId: "test-user-id",
      name: "Shoe",
      amount: new Decimal(100),
      category: "Shopping",
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await fetch(`${url}/api/one-time`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Shoe",
        amount: 100,
        category: "Shopping",
        date: new Date(),
      }),
    });
    expect(res.status).toBe(201);
  });

  it("PATCH /api/one-time/:id should update item", async () => {
    (prisma.oneTimeTransaction.findFirst as any).mockResolvedValue({
      id: "1",
      userId: "test-user-id",
      name: "Shoe",
      amount: new Decimal(100),
      category: "Shopping",
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    (prisma.oneTimeTransaction.update as any).mockResolvedValue({
      id: "1",
      userId: "test-user-id",
      name: "Shoe",
      amount: new Decimal(110),
      category: "Shopping",
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await fetch(`${url}/api/one-time/1`, {
      method: "PATCH",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 110 }),
    });
    expect(res.status).toBe(200);
  });

  it("DELETE /api/one-time/:id should delete item", async () => {
    (prisma.oneTimeTransaction.findFirst as any).mockResolvedValue({
      id: "1",
      userId: "test-user-id",
    });

    const res = await fetch(`${url}/api/one-time/1`, {
      method: "DELETE",
      headers: authHeaders,
    });
    expect(res.status).toBe(200);
  });
});
