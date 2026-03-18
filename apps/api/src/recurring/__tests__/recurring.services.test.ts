import { describe, it, expect, beforeEach } from "bun:test";
import { Decimal } from "@prisma/client/runtime/client";
import prisma from "../../shared/lib/db";
import * as recurringServices from "../recurring.services";

// Mock prisma

describe("Recurring Services", () => {
  const userId = "test-user-id";
  const mockTransaction = {
    id: "tx-1",
    userId,
    name: "Netflix",
    amount: new Decimal(15),
    type: "SUBSCRIPTION",
    category: "Entertainment",
    frequency: "MONTHLY",
    startDate: new Date("2026-03-01"),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    (prisma.recurringTransactions.findMany as any).mockClear();
    (prisma.recurringTransactions.findFirst as any).mockClear();
    (prisma.recurringTransactions.create as any).mockClear();
    (prisma.recurringTransactions.update as any).mockClear();
    (prisma.recurringTransactions.delete as any).mockClear();
  });

  describe("getAllRecurring", () => {
    it("should return mapped transactions normalized to monthly", async () => {
      const mockDaily = {
        ...mockTransaction,
        frequency: "DAILY",
        amount: new Decimal(10),
      };
      const mockWeekly = {
        ...mockTransaction,
        frequency: "WEEKLY",
        amount: new Decimal(50),
      };
      const mockYearly = {
        ...mockTransaction,
        frequency: "YEARLY",
        amount: new Decimal(120),
      };

      (prisma.recurringTransactions.findMany as any).mockResolvedValue([
        mockTransaction, // Monthly (15)
        mockDaily, // 10 * 365 / 12 = 304.16
        mockWeekly, // 50 * 52 / 12 = 216.66
        mockYearly, // 120 / 12 = 10
      ]);

      const result = await recurringServices.getAllRecurring(userId);

      expect(result.length).toBe(4);
      expect(result[0].normalizedAmount).toBe(15);
      expect(Math.floor(result[1].normalizedAmount)).toBe(304);
      expect(Math.floor(result[2].normalizedAmount)).toBe(216);
      expect(result[3].normalizedAmount).toBe(10);
    });
  });

  describe("getRecurringById", () => {
    it("should return the transaction if found", async () => {
      (prisma.recurringTransactions.findFirst as any).mockResolvedValue(
        mockTransaction,
      );
      const result = await recurringServices.getRecurringById("tx-1", userId);
      expect(result).not.toBeNull();
      expect(result?.name).toBe("Netflix");
    });

    it("should return null if not found", async () => {
      (prisma.recurringTransactions.findFirst as any).mockResolvedValue(null);
      const result = await recurringServices.getRecurringById(
        "invalid",
        userId,
      );
      expect(result).toBeNull();
    });
  });

  describe("createRecurring", () => {
    it("should create and return the created transaction", async () => {
      (prisma.recurringTransactions.create as any).mockResolvedValue(
        mockTransaction,
      );

      const payload = {
        name: "Netflix",
        amount: 15,
        type: "SUBSCRIPTION" as const,
        category: "Entertainment",
        frequency: "MONTHLY" as const,
        startDate: new Date(),
      };

      const result = await recurringServices.createRecurring(userId, payload);
      expect(prisma.recurringTransactions.create).toHaveBeenCalled();
      expect(result.name).toBe("Netflix");
      expect(result.normalizedAmount).toBe(15);
    });
  });

  describe("updateRecurring", () => {
    it("should update and return true if found", async () => {
      (prisma.recurringTransactions.findFirst as any).mockResolvedValue(
        mockTransaction,
      );
      (prisma.recurringTransactions.update as any).mockResolvedValue({
        ...mockTransaction,
        name: "Netflix Premium",
      });

      const result = await recurringServices.updateRecurring("tx-1", userId, {
        name: "Netflix Premium",
      });
      expect(result).not.toBeNull();
      expect(result?.name).toBe("Netflix Premium");
    });

    it("should return null if not found", async () => {
      (prisma.recurringTransactions.findFirst as any).mockResolvedValue(null);
      const result = await recurringServices.updateRecurring(
        "invalid",
        userId,
        { name: "Test" },
      );
      expect(result).toBeNull();
    });
  });

  describe("toggleRecurringStatus", () => {
    it("should toggle the status", async () => {
      (prisma.recurringTransactions.findFirst as any).mockResolvedValue(
        mockTransaction,
      );
      (prisma.recurringTransactions.update as any).mockResolvedValue({
        ...mockTransaction,
        isActive: false,
      });

      const result = await recurringServices.toggleRecurringStatus(
        "tx-1",
        userId,
        false,
      );
      expect(prisma.recurringTransactions.update).toHaveBeenCalled();
      expect(result?.isActive).toBe(false);
    });
  });

  describe("deleteRecurring", () => {
    it("should return true if deleted", async () => {
      (prisma.recurringTransactions.findFirst as any).mockResolvedValue(
        mockTransaction,
      );
      const result = await recurringServices.deleteRecurring("tx-1", userId);
      expect(prisma.recurringTransactions.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should return false if not found", async () => {
      (prisma.recurringTransactions.findFirst as any).mockResolvedValue(null);
      const result = await recurringServices.deleteRecurring("invalid", userId);
      expect(prisma.recurringTransactions.delete).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});
