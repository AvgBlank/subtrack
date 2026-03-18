import { describe, it, expect } from "bun:test";
import {
  createRecurringSchema,
  updateRecurringSchema,
  toggleRecurringSchema,
} from "../recurring";

describe("Recurring Schemas", () => {
  describe("createRecurringSchema", () => {
    it("should validate correct data", () => {
      const data = {
        name: "Netflix",
        amount: 15.99,
        type: "SUBSCRIPTION",
        category: "Entertainment",
        frequency: "MONTHLY",
        startDate: new Date(),
      };
      const result = createRecurringSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should coerce valid amount and date", () => {
      const data = {
        name: "Rent",
        amount: "1000",
        type: "BILL",
        category: "Housing",
        frequency: "MONTHLY",
        startDate: "2026-03-01T00:00:00.000Z",
      };
      const result = createRecurringSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount).toBe(1000);
        expect(result.data.startDate).toBeInstanceOf(Date);
      }
    });

    it("should fail on invalid amount", () => {
      const data = {
        name: "Netflix",
        amount: 0,
        type: "SUBSCRIPTION",
        category: "Entertainment",
        frequency: "MONTHLY",
        startDate: new Date(),
      };
      const result = createRecurringSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should fail on invalid type or frequency", () => {
      const data = {
        name: "Netflix",
        amount: 15,
        type: "INVALID_TYPE",
        category: "Cat",
        frequency: "DAILY",
        startDate: new Date(),
      };
      expect(createRecurringSchema.safeParse(data).success).toBe(false);

      const data2 = { ...data, type: "BILL", frequency: "INVALID_FREQ" };
      expect(createRecurringSchema.safeParse(data2).success).toBe(false);
    });
  });

  describe("updateRecurringSchema", () => {
    it("should allow partial updates", () => {
      const data = { amount: 20 };
      const result = updateRecurringSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should allow empty object", () => {
      expect(updateRecurringSchema.safeParse({}).success).toBe(true);
    });
  });

  describe("toggleRecurringSchema", () => {
    it("should validate exact match boolean isActive", () => {
      expect(toggleRecurringSchema.safeParse({ isActive: true }).success).toBe(
        true,
      );
      expect(
        toggleRecurringSchema.safeParse({ isActive: "true" }).success,
      ).toBe(false);
    });
  });
});
