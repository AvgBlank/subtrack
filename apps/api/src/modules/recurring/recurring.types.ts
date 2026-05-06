export interface DBRecurring {
  id: string;
  name: string;
  amount: number;
  type: string;
  category: string;
  frequency: string;
  startDate: string;
  isActive: boolean;
  normalizedAmount: number;
  createdAt: string;
  updatedAt: string;
}
