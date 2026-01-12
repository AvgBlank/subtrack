import Decimal from "decimal.js";

export type RecurringItemSummary = {
  id: string;
  name: string;
  type: "BILL" | "SUBSCRIPTION";
  category: string;
  frequency: "MONTHLY" | "YEARLY" | "WEEKLY" | "DAILY";
  originalAmount: Decimal;
  normalizedAmount: Decimal; // normalized to a monthly amount
  isActive: boolean;
};

export type RecurringSummary = {
  period: {
    month: number;
    year: number;
  };
  totals: {
    bills: Decimal;
    subscriptions: Decimal;
    total: Decimal;
  };
  counts: {
    bills: number;
    subscriptions: number;
  };
  bills: RecurringItemSummary[];
  subscriptions: RecurringItemSummary[];
  categorySummary: {
    [category: string]: {
      count: number;
      totalOriginalAmount: Decimal;
      totalNormalizedAmount: Decimal;
    };
  };
};

export type IncomeSummary = {
  period: {
    month: number;
    year: number;
  };
  totalIncome: Decimal;
  incomeCount: number;
  incomeSources: {
    sourceName: string;
    amount: Decimal;
  }[];
};

export type OneTimeSummary = {
  period: {
    month: number;
    year: number;
  };
  totalOneTimeTransactions: Decimal;
  oneTimeTransactionCount: number;
  transactions: {
    id: string;
    name: string;
    category: string;
    amount: Decimal;
    date: Date;
  }[];
  categorySummary: {
    [category: string]: {
      count: number;
      totalAmount: Decimal;
    };
  };
};

export type CashFlowSummary = {
  period: {
    month: number;
    year: number;
  };
  totalIncome: Decimal;
  totalRecurringExpenses: Decimal;
  totalOneTimeExpenses: Decimal;
  netCashFlow: Decimal;
};


export type SavingsGoalSummary = {
  id: string;
  name: string;
  targetAmount: Decimal;
  currentAmount: Decimal;
  progressPercentage: number;
  targetDate: Date;
  requiredMonthlyContribution: Decimal;
  isAchievable: boolean;
  monthsRemaining: number;
};

export type SavingsSummary = {
  period: {
    month: number;
    year: number;
  };
  totalRequiredSavings: Decimal;
  totalAvailableCash: Decimal;
  remainingAfterSavings: Decimal;
  savingsGoals: SavingsGoalSummary[];
};

export type MonthlySummary = {
  period: {
    month: number;
    year: number;
  };
  recurring: RecurringSummary;
  income: IncomeSummary;
  oneTime: OneTimeSummary;
  cashFlow: CashFlowSummary;
  savings: SavingsSummary;
};
