import { describe, it, expect } from "bun:test";
import {
  createIncomeSchema,
  updateIncomeSchema,
  toggleIncomeSchema,
} from "../income";

describe("Income Schemas", () => {
  describe("createIncomeSchema", () => {
    it("should validate correct data", () => {
      const data = {
        source: "Salary",
        amount: 5000,
        date: new Date(),
      };
      const result = createIncomeSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should coerce string numbers to number", () => {
      const data = { source: "Salary", amount: "5000", date: "2026-03-01" };
      const result = createIncomeSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount).toBe(5000);
      }
    });

    it("should fail on invalid zero or negative amounts", () => {
      expect(
        createIncomeSchema.safeParse({
          source: "S",
          amount: 0,
          date: new Date(),
        }).success,
      ).toBe(false);
      expect(
        createIncomeSchema.safeParse({
          source: "S",
          amount: -10,
          date: new Date(),
        }).success,
      ).toBe(false);
    });

    it("should fail on empty source", () => {
      expect(
        createIncomeSchema.safeParse({
          source: "",
          amount: 10,
          date: new Date(),
        }).success,
      ).toBe(false);
    });
  });

  describe("updateIncomeSchema", () => {
    it("should allow partial update", () => {
      expect(updateIncomeSchema.safeParse({ amount: 6000 }).success).toBe(true);
    });
  });

  describe("toggleIncomeSchema", () => {
    it("should require isActive boolean", () => {
      expect(toggleIncomeSchema.safeParse({ isActive: false }).success).toBe(
        true,
      );
      expect(toggleIncomeSchema.safeParse({ isActive: 1 }).success).toBe(false);
    });
  });
});
