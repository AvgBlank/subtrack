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
