import { describe, it, expect, beforeEach } from "bun:test";
import { Decimal } from "@prisma/client/runtime/client";
import prisma from "../../shared/lib/db";
import * as summaryServices from "../summary.services";

describe("Summary Services", () => {
  const userId = "test-user-id";

  beforeEach(() => {
    (prisma.recurringTransactions.findMany as any).mockClear();
    (prisma.income.findMany as any).mockClear();
    (prisma.oneTimeTransaction.findMany as any).mockClear();
    (prisma.savingsGoal.findMany as any).mockClear();
  });

  describe("getRecurringSummary", () => {
    it("should segregate bills and subscriptions and calculate category summaries", async () => {
      (prisma.recurringTransactions.findMany as any).mockResolvedValue([
        {
          id: "1",
          type: "BILL",
          frequency: "MONTHLY",
          amount: new Decimal(100),
          category: "Housing",
          isActive: true,
        },
        {
          id: "2",
          type: "SUBSCRIPTION",
          frequency: "MONTHLY",
          amount: new Decimal(15),
          category: "Entertainment",
          isActive: true,
        },
        {
          id: "3",
          type: "SUBSCRIPTION",
          frequency: "YEARLY",
          amount: new Decimal(120),
          category: "Entertainment",
          isActive: true,
        },
      ]);

      const result = await summaryServices.getRecurringSummary(userId, 3, 2026);

      expect(result.bills.length).toBe(1);
      expect(result.subscriptions.length).toBe(2);

      // Normalized amounts
      expect(result.totals.bills).toStrictEqual(new Decimal(100)); // 100
      expect(result.totals.subscriptions).toStrictEqual(new Decimal(25)); // 15 + (120/12)
      expect(result.totals.total).toStrictEqual(new Decimal(125));

      expect(result.categorySummary["Entertainment"].count).toBe(2);
      expect(
        result.categorySummary["Entertainment"].totalNormalizedAmount,
      ).toStrictEqual(new Decimal(25));
    });
  });

  describe("getIncomeSummary", () => {
    it("should calculate total active income", async () => {
      (prisma.income.findMany as any).mockResolvedValue([
        { source: "Job", amount: new Decimal(5000), isActive: true },
        { source: "Side Hustle", amount: new Decimal(1000), isActive: true },
      ]);

      const result = await summaryServices.getIncomeSummary(userId, 3, 2026);
      expect(result.totalIncome).toStrictEqual(new Decimal(6000));
      expect(result.incomeSources.length).toBe(2);
    });
  });

  describe("getOneTimeSummary", () => {
    it("should aggregate by category", async () => {
      (prisma.oneTimeTransaction.findMany as any).mockResolvedValue([
        { amount: new Decimal(50), category: "Food" },
        { amount: new Decimal(30), category: "Food" },
        { amount: new Decimal(100), category: "Shopping" },
      ]);

      const result = await summaryServices.getOneTimeSummary(userId, 3, 2026);
      expect(result.totalOneTimeTransactions).toStrictEqual(new Decimal(180));
      expect(result.categorySummary["Food"].count).toBe(2);
      expect(result.categorySummary["Food"].totalAmount).toStrictEqual(
        new Decimal(80),
      );
    });
  });

  describe("getMonthlySummary", () => {
    it("should aggregate all summary parts", async () => {
      // Mock all findMany's to return empty to speed up the test
      (prisma.recurringTransactions.findMany as any).mockResolvedValue([]);
      (prisma.income.findMany as any).mockResolvedValue([]);
      (prisma.oneTimeTransaction.findMany as any).mockResolvedValue([]);
      (prisma.savingsGoal.findMany as any).mockResolvedValue([]);

      const result = await summaryServices.getMonthlySummary(userId, 3, 2026);

      expect(result.recurring).toBeDefined();
      expect(result.income).toBeDefined();
      expect(result.oneTime).toBeDefined();
      expect(result.cashFlow).toBeDefined();
      expect(result.savings).toBeDefined();
    });
  });
});
