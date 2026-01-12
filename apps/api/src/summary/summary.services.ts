import { Decimal } from "@prisma/client/runtime/client";
import prisma from "@/shared/lib/db";
import type { RecurringSummary } from "@subtrack/shared/types/summary";
import { getDays } from "@/summary/utils/getDays";

export const getRecurringSummary = async (
  userId: string,
  month: number,
  year: number,
): Promise<RecurringSummary> => {
  // Fetch raw data
  const recTransactions = await prisma.recurringTransactions.findMany({
    where: {
      userId,
      isActive: true,
      startDate: { lte: new Date(year, month - 1, getDays(month, year)) },
    },
  });

  // Normalize amounts
  const normalizedTransactions = recTransactions.map((item) => {
    let normalizedAmount = item.amount;
    if (item.frequency === "WEEKLY") {
      normalizedAmount = item.amount.mul(52).div(12);
    } else if (item.frequency === "DAILY") {
      normalizedAmount = item.amount.mul(365).div(12);
    } else if (item.frequency === "YEARLY") {
      normalizedAmount = item.amount.div(12);
    }
    return { ...item, normalizedAmount };
  });

  // Segregate bills and subscriptions
  const bills: RecurringSummary["bills"] = normalizedTransactions
    .filter((item) => item.type === "BILL")
    .map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      category: item.category,
      frequency: item.frequency,
      originalAmount: item.amount,
      normalizedAmount: item.normalizedAmount,
      isActive: item.isActive,
    }));
  const subscriptions: RecurringSummary["subscriptions"] =
    normalizedTransactions
      .filter((item) => item.type === "SUBSCRIPTION")
      .map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        category: item.category,
        frequency: item.frequency,
        originalAmount: item.amount,
        normalizedAmount: item.normalizedAmount,
        isActive: item.isActive,
      }));

  // Calculate totals
  const totalBills = bills.reduce(
    (sum, item) => sum.add(item.normalizedAmount),
    new Decimal(0),
  );
  const totalSubscriptions = subscriptions.reduce(
    (sum, item) => sum.add(item.normalizedAmount),
    new Decimal(0),
  );
  const total = totalBills.add(totalSubscriptions);

  // Category summary
  const categorySummary: RecurringSummary["categorySummary"] = {};
  normalizedTransactions.forEach((item) => {
    if (!categorySummary[item.category]) {
      categorySummary[item.category] = {
        count: 0,
        totalOriginalAmount: new Decimal(0),
        totalNormalizedAmount: new Decimal(0),
      };
    }
    categorySummary[item.category].count += 1;
    categorySummary[item.category].totalOriginalAmount = categorySummary[
      item.category
    ].totalOriginalAmount.add(item.amount);
    categorySummary[item.category].totalNormalizedAmount = categorySummary[
      item.category
    ].totalNormalizedAmount.add(item.normalizedAmount);
  });

  // Merge all data into final summary
  const recurringSummary: RecurringSummary = {
    period: { month, year },
    totals: {
      bills: totalBills,
      subscriptions: totalSubscriptions,
      total,
    },
    bills,
    subscriptions,
    categorySummary,
  };
  return recurringSummary;
};
