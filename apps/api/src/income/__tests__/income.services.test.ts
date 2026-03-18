import { describe, it, expect, beforeEach } from "bun:test";
import { Decimal } from "@prisma/client/runtime/client";
import prisma from "../../shared/lib/db";
import * as incomeServices from "../income.services";

describe("Income Services", () => {
  const userId = "test-user-id";
  const mockIncome = {
    id: "inc-1",
    userId,
    source: "Salary",
    amount: new Decimal(5000),
    date: new Date("2026-03-01"),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    (prisma.income.findMany as any).mockClear();
    (prisma.income.findFirst as any).mockClear();
    (prisma.income.create as any).mockClear();
    (prisma.income.update as any).mockClear();
    (prisma.income.delete as any).mockClear();
  });

  describe("getAllIncome", () => {
    it("should return formatted income records", async () => {
      (prisma.income.findMany as any).mockResolvedValue([mockIncome]);
      const result = await incomeServices.getAllIncome(userId);
      expect(result.length).toBe(1);
      expect(result[0].amount).toBe(5000);
      expect(result[0].source).toBe("Salary");
    });
  });

  describe("getIncomeById", () => {
    it("should return the income if found", async () => {
      (prisma.income.findFirst as any).mockResolvedValue(mockIncome);
      const result = await incomeServices.getIncomeById("inc-1", userId);
      expect(result).not.toBeNull();
      expect(result?.amount).toBe(5000);
    });

    it("should return null if not found", async () => {
      (prisma.income.findFirst as any).mockResolvedValue(null);
      const result = await incomeServices.getIncomeById("invalid", userId);
      expect(result).toBeNull();
    });
  });

  describe("createIncome", () => {
    it("should create and return the created income", async () => {
      (prisma.income.create as any).mockResolvedValue(mockIncome);
      const payload = { source: "Salary", amount: 5000, date: new Date() };
      const result = await incomeServices.createIncome(userId, payload);
      expect(prisma.income.create).toHaveBeenCalled();
      expect(result.amount).toBe(5000);
    });
  });

  describe("updateIncome", () => {
    it("should update if found", async () => {
      (prisma.income.findFirst as any).mockResolvedValue(mockIncome);
      (prisma.income.update as any).mockResolvedValue({
        ...mockIncome,
        amount: new Decimal(6000),
      });
      const result = await incomeServices.updateIncome("inc-1", userId, {
        amount: 6000,
      });
      expect(result?.amount).toBe(6000);
    });
  });

  describe("toggleIncomeStatus", () => {
    it("should toggle the status", async () => {
      (prisma.income.findFirst as any).mockResolvedValue(mockIncome);
      (prisma.income.update as any).mockResolvedValue({
        ...mockIncome,
        isActive: false,
      });
      const result = await incomeServices.toggleIncomeStatus(
        "inc-1",
        userId,
        false,
      );
      expect(result?.isActive).toBe(false);
    });
  });

  describe("deleteIncome", () => {
    it("should return true if deleted", async () => {
      (prisma.income.findFirst as any).mockResolvedValue(mockIncome);
      const result = await incomeServices.deleteIncome("inc-1", userId);
      expect(prisma.income.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
});
