export type ExportType =
  | "monthly-summary"
  | "recurring"
  | "one-time"
  | "income"
  | "full";

// xlsx removed — CSV only
export type ExportFormat = "csv";

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
