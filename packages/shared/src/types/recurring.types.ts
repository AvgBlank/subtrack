import type { RecurringFrequency, RecurringType } from "../schemas/recurring";

export type RecurringTransaction = {
  id: string;
  name: string;
  amount: number;
  type: RecurringType;
  category: string;
  frequency: RecurringFrequency;
  startDate: string;
  isActive: boolean;
  normalizedAmount: number; // Monthly normalized amount
  createdAt: string;
  updatedAt: string;
};
