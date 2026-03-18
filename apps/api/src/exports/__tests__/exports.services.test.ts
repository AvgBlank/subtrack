import { describe, it, expect, beforeEach } from "bun:test";
import { Decimal } from "@prisma/client/runtime/client";
import prisma from "../../shared/lib/db";
import * as exportServices from "../exports.services";

describe("Exports Services", () => {
  const userId = "test-user-id";
  const range = { startMonth: 1, startYear: 2026, endMonth: 3, endYear: 2026 }; // Jan to Mar 2026

  beforeEach(() => {
    (prisma.income.findMany as any).mockClear();
    (prisma.oneTimeTransaction.findMany as any).mockClear();
    (prisma.recurringTransactions.findMany as any).mockClear();
    (prisma.savingsGoal.findMany as any).mockClear();
  });

  describe("getMonthlySummaryData", () => {
    it("should generate a row for each month in the range", async () => {
      // Mock data so 3 rows are produced without math issues
      (prisma.income.findMany as any).mockResolvedValue([]);
      (prisma.savingsGoal.findMany as any).mockResolvedValue([]);
      (prisma.recurringTransactions.findMany as any).mockResolvedValue([]);
      (prisma.oneTimeTransaction.findMany as any).mockResolvedValue([]);

      const data = await exportServices.getMonthlySummaryData(userId, range);

      expect(data.length).toBe(3);
      expect(data[0].month).toBe("January");
      expect(data[0].year).toBe(2026);
      expect(data[2].month).toBe("March");
    });

    it("should aggregate data into columns", async () => {
      (prisma.income.findMany as any).mockResolvedValue([
        { amount: new Decimal(5000), isActive: true },
      ]);
      (prisma.savingsGoal.findMany as any).mockResolvedValue([
        {
          targetAmount: new Decimal(2000),
          currentAmount: new Decimal(1000),
          targetDate: new Date("2026-12-01"), // Roughly 10 months away
        },
      ]);
      (prisma.recurringTransactions.findMany as any).mockResolvedValue([
        {
          amount: new Decimal(100),
          frequency: "MONTHLY",
          isActive: true,
        },
      ]);
      (prisma.oneTimeTransaction.findMany as any).mockResolvedValue([
        {
          amount: new Decimal(50),
          date: new Date(),
        },
      ]);

      const data = await exportServices.getMonthlySummaryData(userId, range);

      expect(data.length).toBe(3);
      const row = data[0];
      expect(row.income).toBe(5000);
      expect(row.recurringExpenses).toBe(100);
      expect(row.oneTimeExpenses).toBe(50); // The mocked oneTime return will hit every month in this stub setup
    });
  });

  describe("CSV Generation utilities", () => {
    it("generateIncomeCSV should handle escaping correctly", () => {
      const data = [
        {
          source: "Job, side hustle", // Has comma, requires quotes
          amount: 15.5,
          date: "2026-03-01",
          status: "Active",
        },
      ];

      const csv = exportServices.generateIncomeCSV(data);
      expect(csv).toContain('"Job, side hustle"');
      expect(csv).toContain("15.5");
      expect(csv).toContain("Source,Amount,Date,Status"); // Headers
    });
  });
});
