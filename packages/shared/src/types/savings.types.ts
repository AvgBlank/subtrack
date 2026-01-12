export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  createdAt: string;
  updatedAt: string;
};

export type SavingsGoalWithProgress = SavingsGoal & {
  progressPercentage: number;
  requiredMonthlyContribution: number;
  monthsRemaining: number;
  status: "on-track" | "tight" | "at-risk";
};
