import { describe, it, expect } from "bun:test";
import { createSavingsGoalSchema, updateSavingsGoalSchema } from "../savings";

describe("Savings Schemas", () => {
  describe("createSavingsGoalSchema", () => {
    it("should validate correct data", () => {
      const data = {
        name: "Emergency Fund",
        targetAmount: 10000,
        currentAmount: 1000,
        targetDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        ),
      };
      const result = createSavingsGoalSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should allow string numbers and coerce dates", () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const data = {
        name: "Car",
        targetAmount: "5000",
        currentAmount: "0",
        targetDate: futureDate,
      };
      const result = createSavingsGoalSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.targetAmount).toBe(5000);
        expect(result.data.currentAmount).toBe(0);
      }
    });

    it("should fail when targetDate is in the past", () => {
      const pastDate = new Date(Date.now() - 86400000);
      const data = {
        name: "Invalid",
        targetAmount: 1000,
        currentAmount: 0,
        targetDate: pastDate,
      };
      const result = createSavingsGoalSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Target date must be in the future",
        );
      }
    });

    it("should fail when currentAmount > targetAmount", () => {
      const futureDate = new Date(Date.now() + 86400000);
      const data = {
        name: "Invalid",
        targetAmount: 1000,
        currentAmount: 1500,
        targetDate: futureDate,
      };
      const result = createSavingsGoalSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Target amount must be greater than current amount",
        );
      }
    });

    it("should fail on negative amounts", () => {
      const futureDate = new Date(Date.now() + 86400000);
      expect(
        createSavingsGoalSchema.safeParse({
          name: "A",
          targetAmount: -100,
          currentAmount: 0,
          targetDate: futureDate,
        }).success,
      ).toBe(false);
      expect(
        createSavingsGoalSchema.safeParse({
          name: "A",
          targetAmount: 100,
          currentAmount: -10,
          targetDate: futureDate,
        }).success,
      ).toBe(false);
    });
  });

  describe("updateSavingsGoalSchema", () => {
    it("should allow partial updates", () => {
      expect(
        updateSavingsGoalSchema.safeParse({ targetAmount: 20000 }).success,
      ).toBe(true);
      expect(
        updateSavingsGoalSchema.safeParse({ currentAmount: 2000 }).success,
      ).toBe(true);
    });

    it("should fail when updating targetDate to the past", () => {
      const pastDate = new Date(Date.now() - 86400000);
      expect(
        updateSavingsGoalSchema.safeParse({ targetDate: pastDate }).success,
      ).toBe(false);
    });
  });
});
