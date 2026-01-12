import { Decimal } from "@prisma/client/runtime/client";
import prisma from "@/shared/lib/db";
import type {
  CashFlowSummary,
  IncomeSummary,
  MonthlySummary,
  OneTimeSummary,
  RecurringSummary,
  SavingsGoalSummary,
  SavingsSummary,
} from "@subtrack/shared/types/summary";
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

  // Counts
  const billsCount = bills.length;
  const subscriptionsCount = subscriptions.length;

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
    counts: {
      bills: billsCount,
      subscriptions: subscriptionsCount,
    },
    bills,
    subscriptions,
    categorySummary,
  };
  return recurringSummary;
};

export const getIncomeSummary = async (
  userId: string,
  month: number,
  year: number,
): Promise<IncomeSummary> => {
  // Fetch raw data
  const income = await prisma.income.findMany({
    where: { userId, isActive: true },
  });

  // Calculate total
  const totalIncome = income.reduce(
    (sum, item) => sum.add(item.amount),
    new Decimal(0),
  );

  // Count of income sources
  const incomeCount = income.length;

  // Income sources
  const incomeSources = income.map((item) => ({
    sourceName: item.source,
    amount: item.amount,
  }));

  // Merge all data into final summary
  const incomeSummary: IncomeSummary = {
    period: { month, year },
    totalIncome,
    incomeCount,
    incomeSources,
  };
  return incomeSummary;
};

export const getOneTimeSummary = async (
  userId: string,
  month: number,
  year: number,
): Promise<OneTimeSummary> => {
  // Fetch raw data
  const oneTimeTransactions = await prisma.oneTimeTransaction.findMany({
    where: {
      userId,
      date: {
        gte: new Date(year, month - 1, 1),
        lte: new Date(year, month - 1, getDays(month, year)),
      },
    },
  });

  // Calculate total
  const totalOneTimeTransactions = oneTimeTransactions.reduce(
    (sum, item) => sum.add(item.amount),
    new Decimal(0),
  );

  // Transactions
  const transactions: OneTimeSummary["transactions"] = oneTimeTransactions.map(
    (item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      amount: item.amount,
      date: item.date,
    }),
  );

  // Count of one-time transactions
  const oneTimeTransactionCount = oneTimeTransactions.length;

  // Category summary
  const categorySummary: OneTimeSummary["categorySummary"] = {};
  oneTimeTransactions.forEach((item) => {
    if (!categorySummary[item.category]) {
      categorySummary[item.category] = {
        count: 0,
        totalAmount: new Decimal(0),
      };
    }
    categorySummary[item.category].count += 1;
    categorySummary[item.category].totalAmount = categorySummary[
      item.category
    ].totalAmount.add(item.amount);
  });

  // Merge all data into final summary
  const oneTimeSummary: OneTimeSummary = {
    period: { month, year },
    totalOneTimeTransactions,
    oneTimeTransactionCount,
    transactions,
    categorySummary,
  };
  return oneTimeSummary;
};

const cashFlow = async (
  recurringSummary: RecurringSummary,
  incomeSummary: IncomeSummary,
  oneTimeSummary: OneTimeSummary,
): Promise<CashFlowSummary> => {
  const netCashFlow = incomeSummary.totalIncome.sub(
    recurringSummary.totals.total.add(oneTimeSummary.totalOneTimeTransactions),
  );

  return {
    period: recurringSummary.period,
    totalRecurringExpenses: recurringSummary.totals.total,
    totalIncome: incomeSummary.totalIncome,
    totalOneTimeExpenses: oneTimeSummary.totalOneTimeTransactions,
    netCashFlow,
  };
};

export const getCashFlowSummary = async (
  userId: string,
  month: number,
  year: number,
): Promise<CashFlowSummary> => {
  // Calculate all totals
  const [recurringSummary, incomeSummary, oneTimeSummary] = await Promise.all([
    getRecurringSummary(userId, month, year),
    getIncomeSummary(userId, month, year),
    getOneTimeSummary(userId, month, year),
  ]);

  // Merge all data into final summary
  const cashFlowSummary = await cashFlow(
    recurringSummary,
    incomeSummary,
    oneTimeSummary,
  );
  return cashFlowSummary;
};

export const getMonthlySummary = async (
  userId: string,
  month: number,
  year: number,
): Promise<MonthlySummary> => {
  // Calculate all summaries
  const [recurringSummary, incomeSummary, oneTimeSummary] = await Promise.all([
    getRecurringSummary(userId, month, year),
    getIncomeSummary(userId, month, year),
    getOneTimeSummary(userId, month, year),
  ]);

  // Merge all data into final summary
  const monthlySummary: MonthlySummary = {
    period: { month, year },
    recurring: recurringSummary,
    income: incomeSummary,
    oneTime: oneTimeSummary,
    cashFlow: await cashFlow(recurringSummary, incomeSummary, oneTimeSummary),
  };
  return monthlySummary;
};

export const getSavingsGoalSummary = async (
  userId: string,
): Promise<SavingsGoalSummary[]> => {
  // Fetch savings goals
  const savingsGoals = await prisma.savingsGoal.findMany({
    where: {
      userId,
    },
  });

  // Calculations
  const savingsGoalSummary: SavingsGoalSummary[] = savingsGoals.map((goal) => {
    const percentComplete = goal.currentAmount.div(goal.targetAmount).mul(100);
    const monthsRemaining = Math.ceil(
      (goal.targetDate.getFullYear() - new Date().getFullYear()) * 12 +
        (goal.targetDate.getMonth() - new Date().getMonth()),
    );
    const isAchievable = monthsRemaining > 0;

    return {
      id: goal.id,
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      progressPercentage: percentComplete.toNumber(),
      targetDate: goal.targetDate,
      monthsRemaining: Math.max(monthsRemaining, 0),
      isAchievable: isAchievable,
      requiredMonthlyContribution: isAchievable
        ? goal.targetAmount
            .sub(goal.currentAmount)
            .div(new Decimal(monthsRemaining))
        : new Decimal(0),
    };
  });

  return savingsGoalSummary;
};

export const getSavingsSummary = async (
  userId: string,
): Promise<SavingsSummary> => {
  // Fetch savings goals
  const savingsGoals = await getSavingsGoalSummary(userId);

  // Fetch net cash flow
  const cashFlow = await getCashFlowSummary(
    userId,
    new Date().getMonth() + 1,
    new Date().getFullYear(),
  );

  // Calculate total required savings
  const totalRequiredSavings = savingsGoals.reduce(
    (sum, goal) => sum.add(goal.requiredMonthlyContribution),
    new Decimal(0),
  );

  // Remaining after savings
  const remainingAfterSavings = cashFlow.netCashFlow.sub(totalRequiredSavings);

  // Merge all data into final summary
  const savingsSummary: SavingsSummary = {
    period: cashFlow.period,
    totalRequiredSavings,
    totalAvailableCash: cashFlow.netCashFlow,
    remainingAfterSavings,
    savingsGoals,
  };
  return savingsSummary;
};

export const getCanISpend = async (userId: string, amount: Decimal) => {
  const savingsSummary = await getSavingsSummary(userId);
  const remainingAfterSavings =
    savingsSummary.remainingAfterSavings.sub(amount);

  return {
    canSpend: remainingAfterSavings.gte(0),
    remainingAfterSpend: remainingAfterSavings.toNumber(),
  };
};
