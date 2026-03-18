import { describe, it, expect, beforeEach } from "bun:test";
import { Decimal } from "@prisma/client/runtime/client";
import prisma from "../../shared/lib/db";
import * as oneTimeServices from "../one-time.services";
import { getDays } from "../../summary/utils/getDays";

describe("One-Time Services", () => {
  const userId = "test-user-id";
  const mockTransaction = {
    id: "ot-1",
    userId,
    name: "Grocery",
    amount: new Decimal(100),
    category: "Food",
    date: new Date("2026-03-15"),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    (prisma.oneTimeTransaction.findMany as any).mockClear();
    (prisma.oneTimeTransaction.findFirst as any).mockClear();
    (prisma.oneTimeTransaction.create as any).mockClear();
    (prisma.oneTimeTransaction.update as any).mockClear();
    (prisma.oneTimeTransaction.delete as any).mockClear();
  });

  describe("getOneTimeByMonth", () => {
    it("should fetch items for the specific date range", async () => {
      (prisma.oneTimeTransaction.findMany as any).mockResolvedValue([
        mockTransaction,
      ]);

      const result = await oneTimeServices.getOneTimeByMonth(userId, 3, 2026);

      expect(prisma.oneTimeTransaction.findMany).toHaveBeenCalled();
      const callArgs = (prisma.oneTimeTransaction.findMany as any).mock
        .calls[0][0];

      // Validate the gte and lte dates generated
      expect(callArgs.where.date.gte).toEqual(new Date(2026, 2, 1)); // Month is 0-indexed in JS dates
      expect(callArgs.where.date.lte).toEqual(
        new Date(new Date(2026, 2, getDays(3, 2026)).setHours(23, 59, 59, 999)),
      );

      expect(result.length).toBe(1);
    });
  });

  describe("getOneTimeById", () => {
    it("should return mapped transaction if found", async () => {
      (prisma.oneTimeTransaction.findFirst as any).mockResolvedValue(
        mockTransaction,
      );
      const result = await oneTimeServices.getOneTimeById("ot-1", userId);
      expect(result?.amount).toBe(100);
    });
  });

  describe("createOneTime", () => {
    it("should create a new one time transaction", async () => {
      (prisma.oneTimeTransaction.create as any).mockResolvedValue(
        mockTransaction,
      );
      const result = await oneTimeServices.createOneTime(userId, {
        name: "Grocery",
        amount: 100,
        category: "Food",
        date: new Date(),
      });
      expect(prisma.oneTimeTransaction.create).toHaveBeenCalled();
      expect(result.name).toBe("Grocery");
    });
  });

  describe("updateOneTime", () => {
    it("should update and return", async () => {
      (prisma.oneTimeTransaction.findFirst as any).mockResolvedValue(
        mockTransaction,
      );
      (prisma.oneTimeTransaction.update as any).mockResolvedValue({
        ...mockTransaction,
        amount: new Decimal(150),
      });
      const result = await oneTimeServices.updateOneTime("ot-1", userId, {
        amount: 150,
      });
      expect(result?.amount).toBe(150);
    });
  });

  describe("deleteOneTime", () => {
    it("should delete and return true", async () => {
      (prisma.oneTimeTransaction.findFirst as any).mockResolvedValue(
        mockTransaction,
      );
      const result = await oneTimeServices.deleteOneTime("ot-1", userId);
      expect(prisma.oneTimeTransaction.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
});
