import prisma from "@/shared/lib/db";
import { Decimal } from "@/generated/prisma/internal/prismaNamespace";

export type ExportType =
  | "monthly-summary"
  | "recurring"
  | "one-time"
  | "income"
  | "full";

export type ExportFormat = "csv" | "xlsx";

export interface MonthRange {
  startMonth: number;
  startYear: number;
  endMonth: number;
  endYear: number;
}

export interface MonthlySummaryRow {
  month: string;
  year: number;
  income: number;
  recurringExpenses: number;
  oneTimeExpenses: number;
  totalExpenses: number;
  savingsRequired: number;
  remainingCash: number;
}

export interface RecurringExportRow {
  name: string;
  type: string;
  category: string;
  frequency: string;
  amount: number;
  normalizedMonthlyAmount: number;
  status: string;
}

export interface OneTimeExportRow {
  name: string;
  category: string;
  amount: number;
  date: string;
}

export interface IncomeExportRow {
  source: string;
  amount: number;
  date: string;
  status: string;
}

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

const normalizeToMonthly = (amount: Decimal, frequency: string): number => {
  if (frequency === "DAILY") {
    return amount.mul(365).div(12).toNumber();
  } else if (frequency === "WEEKLY") {
    return amount.mul(52).div(12).toNumber();
  } else if (frequency === "YEARLY") {
    return amount.div(12).toNumber();
  }
  return amount.toNumber();
};

const getMonthsInRange = (range: MonthRange): { month: number; year: number }[] => {
  const months: { month: number; year: number }[] = [];
  let { startMonth, startYear } = range;
  const { endMonth, endYear } = range;

  while (startYear < endYear || (startYear === endYear && startMonth <= endMonth)) {
    months.push({ month: startMonth, year: startYear });
    startMonth++;
    if (startMonth > 12) {
      startMonth = 1;
      startYear++;
    }
  }

  return months;
};

export const getMonthlySummaryData = async (
  userId: string,
  range: MonthRange
): Promise<MonthlySummaryRow[]> => {
  const months = getMonthsInRange(range);
  const rows: MonthlySummaryRow[] = [];

  // Get active income (constant across months)
  const incomeRecords = await prisma.income.findMany({
    where: { userId, isActive: true },
  });
  const totalIncome = incomeRecords.reduce(
    (sum, i) => sum + i.amount.toNumber(),
    0
  );

  // Get active savings goals and compute required monthly contribution
  const savingsGoals = await prisma.savingsGoal.findMany({
    where: { userId },
  });
  
  const totalSavingsRequired = savingsGoals.reduce((sum, goal) => {
    const now = new Date();
    const monthsRemaining = Math.ceil(
      (goal.targetDate.getFullYear() - now.getFullYear()) * 12 +
        (goal.targetDate.getMonth() - now.getMonth())
    );
    if (monthsRemaining <= 0) return sum;
    const remaining = goal.targetAmount.sub(goal.currentAmount);
    const monthlyRequired = remaining.div(new Decimal(monthsRemaining));
    return sum + monthlyRequired.toNumber();
  }, 0);

  // Get all recurring transactions
  const recurring = await prisma.recurringTransactions.findMany({
    where: { userId, isActive: true },
  });

  // Calculate normalized recurring total
  const recurringTotal = recurring.reduce((sum, r) => {
    return sum + normalizeToMonthly(r.amount, r.frequency);
  }, 0);

  for (const { month, year } of months) {
    // Get one-time transactions for this month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const oneTime = await prisma.oneTimeTransaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
    });

    const oneTimeTotal = oneTime.reduce(
      (sum, t) => sum + t.amount.toNumber(),
      0
    );

    const totalExpenses = recurringTotal + oneTimeTotal;
    const remainingCash = totalIncome - totalExpenses - totalSavingsRequired;

    rows.push({
      month: MONTH_NAMES[month - 1],
      year,
      income: totalIncome,
      recurringExpenses: recurringTotal,
      oneTimeExpenses: oneTimeTotal,
      totalExpenses,
      savingsRequired: totalSavingsRequired,
      remainingCash,
    });
  }

  return rows;
};

export const getRecurringData = async (
  userId: string
): Promise<RecurringExportRow[]> => {
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
};

export const getOneTimeData = async (
  userId: string,
  range: MonthRange
): Promise<OneTimeExportRow[]> => {
  const startDate = new Date(range.startYear, range.startMonth - 1, 1);
  const endDate = new Date(range.endYear, range.endMonth, 0, 23, 59, 59, 999);

  const transactions = await prisma.oneTimeTransaction.findMany({
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: "desc" },
  });

  return transactions.map((t) => ({
    name: t.name,
    category: t.category,
    amount: t.amount.toNumber(),
    date: t.date.toISOString().split("T")[0],
  }));
};

export const getIncomeData = async (userId: string): Promise<IncomeExportRow[]> => {
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
};

// CSV generation utilities
const escapeCSVValue = (value: string | number): string => {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const arrayToCSV = <T extends object>(
  data: T[],
  headers: { key: keyof T; label: string }[]
): string => {
  if (data.length === 0) return "";

  const headerRow = headers.map((h) => escapeCSVValue(h.label)).join(",");
  const dataRows = data.map((row) =>
    headers.map((h) => escapeCSVValue(row[h.key] as string | number)).join(",")
  );

  return [headerRow, ...dataRows].join("\n");
};

export const generateMonthlySummaryCSV = (data: MonthlySummaryRow[]): string => {
  return arrayToCSV(data, [
    { key: "month", label: "Month" },
    { key: "year", label: "Year" },
    { key: "income", label: "Income" },
    { key: "recurringExpenses", label: "Recurring Expenses" },
    { key: "oneTimeExpenses", label: "One-time Expenses" },
    { key: "totalExpenses", label: "Total Expenses" },
    { key: "savingsRequired", label: "Savings Required" },
    { key: "remainingCash", label: "Remaining Cash" },
  ]);
};

export const generateRecurringCSV = (data: RecurringExportRow[]): string => {
  return arrayToCSV(data, [
    { key: "name", label: "Name" },
    { key: "type", label: "Type" },
    { key: "category", label: "Category" },
    { key: "frequency", label: "Frequency" },
    { key: "amount", label: "Amount" },
    { key: "normalizedMonthlyAmount", label: "Monthly Amount" },
    { key: "status", label: "Status" },
  ]);
};

export const generateOneTimeCSV = (data: OneTimeExportRow[]): string => {
  return arrayToCSV(data, [
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "amount", label: "Amount" },
    { key: "date", label: "Date" },
  ]);
};

export const generateIncomeCSV = (data: IncomeExportRow[]): string => {
  return arrayToCSV(data, [
    { key: "source", label: "Source" },
    { key: "amount", label: "Amount" },
    { key: "date", label: "Date" },
    { key: "status", label: "Status" },
  ]);
};
