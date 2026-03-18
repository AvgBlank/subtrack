import { describe, it, expect, beforeEach } from "bun:test";
import { Decimal } from "@prisma/client/runtime/client";
import prisma from "../../shared/lib/db";
import * as savingsServices from "../savings.services";

describe("Savings Services", () => {
  const userId = "test-user-id";
  const mockSavings = {
    id: "sav-1",
    userId,
    name: "Emergency Fund",
    targetAmount: new Decimal(10000),
    currentAmount: new Decimal(2000),
    targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 12 months from now
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    (prisma.savingsGoal.findMany as any).mockClear();
    (prisma.savingsGoal.findFirst as any).mockClear();
    (prisma.savingsGoal.create as any).mockClear();
    (prisma.savingsGoal.update as any).mockClear();
    (prisma.savingsGoal.delete as any).mockClear();
  });

  describe("getAllSavingsGoals", () => {
    it("should return goals with calculated progress and required contribution", async () => {
      (prisma.savingsGoal.findMany as any).mockResolvedValue([mockSavings]);

      const result = await savingsServices.getAllSavingsGoals(userId);

      expect(result.length).toBe(1);
      const goal = result[0];
      expect(goal.progressPercentage).toBe(20); // 2000 / 10000 * 100

      // Calculate expected remaining months roughly
      const expectedMonths = Math.ceil(
        (mockSavings.targetDate.getFullYear() - new Date().getFullYear()) * 12 +
          (mockSavings.targetDate.getMonth() - new Date().getMonth()),
      );

      expect(goal.monthsRemaining).toBe(expectedMonths);
      expect(goal.status).toBe("on-track");

      const expectedReq = 8000 / expectedMonths; // 8000 remaining / 12 months = 666.66
      // Convert Decimal to number for rough check
      expect(Math.floor(goal.requiredMonthlyContribution)).toBe(
        Math.floor(expectedReq),
      );
    });

    it("should calculate status correctly", async () => {
      // test on track
      (prisma.savingsGoal.findMany as any).mockResolvedValue([
        { ...mockSavings, currentAmount: new Decimal(10000) },
      ]);
      let res = await savingsServices.getAllSavingsGoals(userId);
      expect(res[0].status).toBe("on-track");

      // test at-risk (over 15% required per month)
      (prisma.savingsGoal.findMany as any).mockResolvedValue([
        {
          ...mockSavings,
          currentAmount: new Decimal(0),
          targetAmount: new Decimal(10000),
          targetDate: new Date(new Date().setMonth(new Date().getMonth() + 2)), // 2 months left -> 5000/mo = 50%
        },
      ]);
      res = await savingsServices.getAllSavingsGoals(userId);
      expect(res[0].status).toBe("at-risk");

      // test tight (8-15% required per month)
      (prisma.savingsGoal.findMany as any).mockResolvedValue([
        {
          ...mockSavings,
          currentAmount: new Decimal(0),
          targetAmount: new Decimal(10000),
          targetDate: new Date(new Date().setMonth(new Date().getMonth() + 10)), // 10 months left -> 1000/mo = 10%
        },
      ]);
      res = await savingsServices.getAllSavingsGoals(userId);
      expect(res[0].status).toBe("tight");
    });
  });

  describe("getSavingsGoalById", () => {
    it("should return goal with progress if found", async () => {
      (prisma.savingsGoal.findFirst as any).mockResolvedValue(mockSavings);
      const result = await savingsServices.getSavingsGoalById("sav-1", userId);
      expect(result).not.toBeNull();
      expect(result?.name).toBe("Emergency Fund");
      expect(result?.progressPercentage).toBe(20);
    });
  });

  describe("createSavingsGoal", () => {
    it("should create goal and return with progress", async () => {
      (prisma.savingsGoal.create as any).mockResolvedValue(mockSavings);
      const result = await savingsServices.createSavingsGoal(userId, {
        name: "test",
        targetAmount: 10000,
        currentAmount: 2000,
        targetDate: mockSavings.targetDate,
      });
      expect(result.progressPercentage).toBe(20);
    });
  });

  describe("updateSavingsGoal", () => {
    it("should update goal if found", async () => {
      (prisma.savingsGoal.findFirst as any).mockResolvedValue(mockSavings);
      (prisma.savingsGoal.update as any).mockResolvedValue({
        ...mockSavings,
        currentAmount: new Decimal(5000),
      });
      const result = await savingsServices.updateSavingsGoal("sav-1", userId, {
        currentAmount: 5000,
      });
      expect(result?.progressPercentage).toBe(50);
    });
  });

  describe("deleteSavingsGoal", () => {
    it("should delete goal if found", async () => {
      (prisma.savingsGoal.findFirst as any).mockResolvedValue(mockSavings);
      const result = await savingsServices.deleteSavingsGoal("sav-1", userId);
      expect(prisma.savingsGoal.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
});
