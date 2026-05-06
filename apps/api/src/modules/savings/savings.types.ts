export type SavingsStatus = "on-track" | "tight" | "at-risk";

export interface DBSavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  progressPercentage: number;
  requiredMonthlyContribution: number;
  monthsRemaining: number;
  status: SavingsStatus;
  createdAt: string;
  updatedAt: string;
}
