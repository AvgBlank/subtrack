import { getSummary } from "@/lib/api/summary";
import type { MonthlySummary } from "@subtrack/shared/types/summary";
import { Decimal } from "decimal.js";

export type AnalyticsData = {
  months: MonthData[];
  categoryTotals: CategoryTotal[];
  currentMonthCategories: CategoryTotal[];
};

export type MonthData = {
  month: number;
  year: number;
  label: string;
  income: number;
  totalExpenses: number;
  netCashFlow: number;
  bills: number;
  subscriptions: number;
  oneTime: number;
  categorySummary: Record<string, number>;
};

export type CategoryTotal = {
  category: string;
  total: number;
};

const getMonthLabel = (month: number, year: number): string => {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
};

const getMonthsRange = (
  numMonths: number,
): { month: number; year: number }[] => {
  const now = new Date();
  const months: { month: number; year: number }[] = [];

  for (let i = numMonths - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    });
  }

  return months;
};

const mergeCategorySummaries = (
  recurring: Record<string, { count: number; totalNormalizedAmount: Decimal }>,
  oneTime: Record<string, { count: number; totalAmount: Decimal }>,
): Record<string, number> => {
  const merged: Record<string, number> = {};

  // Add recurring categories
  for (const [category, data] of Object.entries(recurring)) {
    merged[category] = Number(data.totalNormalizedAmount);
  }

  // Add one-time categories
  for (const [category, data] of Object.entries(oneTime)) {
    merged[category] = (merged[category] || 0) + Number(data.totalAmount);
  }

  return merged;
};

const processMonthSummary = (
  summary: MonthlySummary,
  month: number,
  year: number,
): MonthData => {
  const income = Number(summary.income.totalIncome);
  const bills = Number(summary.recurring.totals.bills);
  const subscriptions = Number(summary.recurring.totals.subscriptions);
  const oneTime = Number(summary.oneTime.totalOneTimeTransactions);
  const totalExpenses = bills + subscriptions + oneTime;
  const netCashFlow = income - totalExpenses;

  const categorySummary = mergeCategorySummaries(
    summary.recurring.categorySummary,
    summary.oneTime.categorySummary,
  );

  return {
    month,
    year,
    label: getMonthLabel(month, year),
    income,
    totalExpenses,
    netCashFlow,
    bills,
    subscriptions,
    oneTime,
    categorySummary,
  };
};

const aggregateTopCategories = (
  months: MonthData[],
): { topCategories: string[]; categoryTotals: CategoryTotal[] } => {
  // Aggregate totals across all months
  const totals: Record<string, number> = {};

  for (const month of months) {
    for (const [category, amount] of Object.entries(month.categorySummary)) {
      totals[category] = (totals[category] || 0) + amount;
    }
  }

  // Sort by total and get top 5
  const sorted = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, total]) => ({ category, total }));

  const topCategories = sorted.slice(0, 5).map((c) => c.category);

  return { topCategories, categoryTotals: sorted };
};

export const getAnalyticsData = async (
  numMonths: number,
): Promise<AnalyticsData> => {
  const monthsRange = getMonthsRange(numMonths);

  // Fetch all months in parallel
  const summaries = await Promise.all(
    monthsRange.map(({ month, year }) =>
      getSummary(String(month), String(year)),
    ),
  );

  // Process each month
  const months = summaries.map((summary, index) =>
    processMonthSummary(
      summary,
      monthsRange[index].month,
      monthsRange[index].year,
    ),
  );

  // Get top categories
  const { categoryTotals } = aggregateTopCategories(months);

  // Get current month category totals
  const currentMonth = months[months.length - 1];
  const currentMonthCategories = Object.entries(currentMonth.categorySummary)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  return { months, categoryTotals, currentMonthCategories };
};
