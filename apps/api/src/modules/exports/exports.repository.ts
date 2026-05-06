import { Decimal } from "@/generated/prisma/internal/prismaNamespace";
import prisma from "@/lib/prisma";
import {
  IncomeExportRow,
  MonthRange,
  MonthlySummaryRow,
  OneTimeExportRow,
  RecurringExportRow,
} from "@/modules/exports/exports.types";
import { normalizeToMonthly } from "@/utils/normalize";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getMonthsInRange = (
  range: MonthRange,
): { month: number; year: number }[] => {
  const months: { month: number; year: number }[] = [];
  let { startMonth, startYear } = range;
  const { endMonth, endYear } = range;

  while (
    startYear < endYear ||
    (startYear === endYear && startMonth <= endMonth)
  ) {
    months.push({ month: startMonth, year: startYear });
    startMonth++;
    if (startMonth > 12) {
      startMonth = 1;
      startYear++;
    }
  }
  return months;
};

export interface IExportRepository {
  getMonthlySummaryData(
    userId: string,
    range: MonthRange,
  ): Promise<MonthlySummaryRow[]>;
  getRecurringData(userId: string): Promise<RecurringExportRow[]>;
  getOneTimeData(
    userId: string,
    range: MonthRange,
  ): Promise<OneTimeExportRow[]>;
  getIncomeData(userId: string): Promise<IncomeExportRow[]>;
}

export class PrismaExportRepository implements IExportRepository {
  public async getMonthlySummaryData(
    userId: string,
    range: MonthRange,
  ): Promise<MonthlySummaryRow[]> {
    const months = getMonthsInRange(range);

    const incomeRecords = await prisma.income.findMany({
      where: { userId, isActive: true },
    });
    const totalIncome = incomeRecords.reduce(
      (sum, i) => sum + i.amount.toNumber(),
      0,
    );

    const savingsGoals = await prisma.savingsGoal.findMany({
      where: { userId },
    });
    const totalSavingsRequired = savingsGoals.reduce((sum, goal) => {
      const now = new Date();
      const monthsRemaining = Math.ceil(
        (goal.targetDate.getFullYear() - now.getFullYear()) * 12 +
          (goal.targetDate.getMonth() - now.getMonth()),
      );
      if (monthsRemaining <= 0) return sum;
      const remaining = goal.targetAmount.sub(goal.currentAmount);
      return sum + remaining.div(new Decimal(monthsRemaining)).toNumber();
    }, 0);

    const recurring = await prisma.recurringTransactions.findMany({
      where: { userId, isActive: true },
    });
    const recurringTotal = recurring.reduce(
      (sum, r) => sum + normalizeToMonthly(r.amount, r.frequency),
      0,
    );

    const rows: MonthlySummaryRow[] = [];
    for (const { month, year } of months) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      const oneTime = await prisma.oneTimeTransaction.findMany({
        where: { userId, date: { gte: startDate, lte: endDate } },
      });
      const oneTimeTotal = oneTime.reduce(
        (sum, t) => sum + t.amount.toNumber(),
        0,
      );

      const totalExpenses = recurringTotal + oneTimeTotal;
      rows.push({
        month: MONTH_NAMES[month - 1],
        year,
        income: totalIncome,
        recurringExpenses: recurringTotal,
        oneTimeExpenses: oneTimeTotal,
        totalExpenses,
        savingsRequired: totalSavingsRequired,
        remainingCash: totalIncome - totalExpenses - totalSavingsRequired,
      });
    }
    return rows;
  }

  public async getRecurringData(
    userId: string,
  ): Promise<RecurringExportRow[]> {
    const transactions = await prisma.recurringTransactions.findMany({
      where: { userId },
      orderBy: [{ isActive: "desc" }, { type: "asc" }, { name: "asc" }],
    });
    return transactions.map((t) => ({
      name: t.name,
      type: t.type,
      category: t.category,
      frequency: t.frequency,
      amount: t.amount.toNumber(),
      normalizedMonthlyAmount: normalizeToMonthly(t.amount, t.frequency),
      status: t.isActive ? "Active" : "Inactive",
    }));
  }

  public async getOneTimeData(
    userId: string,
    range: MonthRange,
  ): Promise<OneTimeExportRow[]> {
    const startDate = new Date(range.startYear, range.startMonth - 1, 1);
    const endDate = new Date(
      range.endYear,
      range.endMonth,
      0,
      23,
      59,
      59,
      999,
    );
    const transactions = await prisma.oneTimeTransaction.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: "desc" },
    });
    return transactions.map((t) => ({
      name: t.name,
      category: t.category,
      amount: t.amount.toNumber(),
      date: t.date.toISOString().split("T")[0],
    }));
  }

  public async getIncomeData(userId: string): Promise<IncomeExportRow[]> {
    const incomes = await prisma.income.findMany({
      where: { userId },
      orderBy: [{ isActive: "desc" }, { date: "desc" }],
    });
    return incomes.map((i) => ({
      source: i.source,
      amount: i.amount.toNumber(),
      date: i.date.toISOString().split("T")[0],
      status: i.isActive ? "Active" : "Inactive",
    }));
  }
}
