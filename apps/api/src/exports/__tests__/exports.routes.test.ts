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

describe("Exports Router Integration", () => {
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
  });

  it("POST /api/exports should export CSV correctly", async () => {
    // Generate some mock data so it doesn't return 400 Empty
    (prisma.recurringTransactions.findMany as any).mockResolvedValue([
      {
        name: "Rent",
        amount: new Decimal(100),
        frequency: "MONTHLY",
        isActive: true,
      },
    ]);

    const res = await fetch(`${url}/api/exports`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        exportType: "recurring",
        format: "csv",
        startMonth: 1,
        startYear: 2026,
        endMonth: 3,
        endYear: 2026,
      }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");
    const text = await res.text();
    expect(text).toContain("Rent");
  });

  it("POST /api/exports should export XLSX correctly", async () => {
    (prisma.income.findMany as any).mockResolvedValue([
      {
        source: "Job",
        amount: new Decimal(5000),
        isActive: true,
        date: new Date(),
      },
    ]);

    const res = await fetch(`${url}/api/exports`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        exportType: "income",
        format: "xlsx",
        startMonth: 1,
        startYear: 2026,
        endMonth: 3,
        endYear: 2026,
      }),
    });

    expect(res.status).toBe(200);
    // Spreadsheet MIME
    expect(res.headers.get("content-type")).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
  });

  it("POST /api/exports should fail on invalid date range", async () => {
    const res = await fetch(`${url}/api/exports`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        exportType: "income",
        format: "csv",
        startMonth: 3,
        startYear: 2026,
        endMonth: 1,
        endYear: 2026, // earlier end date
      }),
    });
    expect(res.status).toBe(400);
  });
});
