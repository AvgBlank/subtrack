import { describe, it, expect } from "bun:test";
import { createOneTimeSchema, updateOneTimeSchema } from "../one-time";

describe("One-Time Transaction Schemas", () => {
  describe("createOneTimeSchema", () => {
    it("should validate correct data", () => {
      const data = {
        name: "Grocery",
        amount: 150.5,
        category: "Food",
        date: new Date(),
      };
      const result = createOneTimeSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should fail on missing or empty name/category", () => {
      const data = { name: "", amount: 10, category: "Cat", date: new Date() };
      expect(createOneTimeSchema.safeParse(data).success).toBe(false);

      const data2 = { name: "A", amount: 10, category: "", date: new Date() };
      expect(createOneTimeSchema.safeParse(data2).success).toBe(false);
    });

    it("should fail on non-positive amounts", () => {
      const data = { name: "A", amount: -5, category: "Cat", date: new Date() };
      expect(createOneTimeSchema.safeParse(data).success).toBe(false);
    });
  });

  describe("updateOneTimeSchema", () => {
    it("should allow partial updates", () => {
      expect(updateOneTimeSchema.safeParse({ amount: 200 }).success).toBe(true);
      expect(
        updateOneTimeSchema.safeParse({ category: "Dining" }).success,
      ).toBe(true);
    });
  });
});
