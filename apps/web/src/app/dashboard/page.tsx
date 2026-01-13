"use client";

import { getSummary } from "@/lib/api/summary";
import { useQuery } from "@tanstack/react-query";
import { HeadlineCards } from "@/components/dashboard/headline-cards";
import { RecurringSnapshot } from "@/components/dashboard/recurring-snapshot";
import { SavingsSnapshot } from "@/components/dashboard/savings-snapshot";
import { CanISpend } from "@/components/dashboard/can-i-spend";
import { LayoutDashboard, AlertCircle } from "lucide-react";

const Dashboard = () => {
  const { data: summary, isLoading } = useQuery({
    queryFn: () => getSummary(),
    queryKey: ["summary"],
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="animate-spin fill-foreground"
          width="32"
          height="32"
          viewBox="0 0 256 256"
        >
          <path d="M236,128a108,108,0,0,1-216,0c0-42.52,24.73-81.34,63-98.9A12,12,0,1,1,93,50.91C63.24,64.57,44,94.83,44,128a84,84,0,0,0,168,0c0-33.17-19.24-63.43-49-77.09A12,12,0,1,1,173,29.1C211.27,46.66,236,85.48,236,128Z"></path>
        </svg>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 dark:bg-red-500/10">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-muted-foreground">Failed to load summary</p>
      </div>
    );
  }

  // Extracting data
  const income = Number(summary.income.totalIncome);
  const recurring = Number(summary.recurring.totals.total);
  const oneTime = Number(summary.oneTime.totalOneTimeTransactions);
  const totalSavings = Number(summary.savings.totalRequiredSavings);
  const remaining = Number(summary.savings.remainingAfterSavings);

  const billsData = {
    total: Number(summary.recurring.totals.bills),
    count: summary.recurring.counts.bills,
    items: summary.recurring.bills.map((bill) => ({
      id: bill.id,
      name: bill.name,
      normalizedAmount: Number(bill.normalizedAmount),
    })),
  };

  const subscriptionsData = {
    total: Number(summary.recurring.totals.subscriptions),
    count: summary.recurring.counts.subscriptions,
    items: summary.recurring.subscriptions.map((sub) => ({
      id: sub.id,
      name: sub.name,
      normalizedAmount: Number(sub.normalizedAmount),
    })),
  };

  const savingsGoals = summary.savings.savingsGoals.map((goal) => ({
    id: goal.id,
    name: goal.name,
    progressPercentage: goal.progressPercentage,
    requiredMonthlyContribution: Number(goal.requiredMonthlyContribution),
    monthsRemaining: goal.monthsRemaining,
  }));

  return (
    <div className="container mx-auto space-y-6 pb-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 dark:bg-primary/10">
          <LayoutDashboard className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Your financial overview
          </p>
        </div>
      </div>

      <HeadlineCards
        income={income}
        recurring={recurring}
        oneTime={oneTime}
        remaining={remaining}
        totalSavings={totalSavings}
      />
      <RecurringSnapshot bills={billsData} subscriptions={subscriptionsData} />
      <SavingsSnapshot
        goals={savingsGoals}
        totalRequiredSavings={totalSavings}
      />
      <CanISpend />
    </div>
  );
};

export default Dashboard;
