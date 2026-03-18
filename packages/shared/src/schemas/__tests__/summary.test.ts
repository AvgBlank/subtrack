import { describe, it, expect } from "bun:test";
import { recurringSummarySchema, canISpendSchema } from "../summary";

describe("Summary Schemas", () => {
  describe("recurringSummarySchema", () => {
    it("should populate defaults", () => {
      // Don't pass ANY args, but Zod requires at least an empty object generally,
      // but the function returns a z.object which has defaults.
      const result = recurringSummarySchema().safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        const d = new Date();
        expect(result.data.month).toBe(d.getMonth() + 1);
        expect(result.data.year).toBe(d.getFullYear());
      }
    });

    it("should override with provided query params", () => {
      const result = recurringSummarySchema().safeParse({
        month: "3",
        year: "2025",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.month).toBe(3);
        expect(result.data.year).toBe(2025);
      }
    });

    it("should fail on invalid month ranges", () => {
      expect(
        recurringSummarySchema().safeParse({ month: 0, year: 2025 }).success,
      ).toBe(false);
      expect(
        recurringSummarySchema().safeParse({ month: 13, year: 2025 }).success,
      ).toBe(false);
    });

    it("should fail on invalid year ranges", () => {
      expect(
        recurringSummarySchema().safeParse({ month: 5, year: 1999 }).success,
      ).toBe(false);
      expect(
        recurringSummarySchema().safeParse({
          month: 5,
          year: new Date().getFullYear() + 1,
        }).success,
      ).toBe(false);
    });
  });

  describe("canISpendSchema", () => {
    it("should validate positive amounts and 0", () => {
      expect(canISpendSchema.safeParse({ amount: 100 }).success).toBe(true);
      expect(canISpendSchema.safeParse({ amount: "50" }).success).toBe(true);
      expect(canISpendSchema.safeParse({ amount: 0 }).success).toBe(true);
    });

    it("should fail on negative amounts", () => {
      expect(canISpendSchema.safeParse({ amount: -10 }).success).toBe(false);
    });
  });
});
