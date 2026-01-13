"use client";

import { getSummary } from "@/lib/api/summary";
import { useQuery } from "@tanstack/react-query";
import { HeadlineCards } from "@/components/dashboard/headline-cards";
import { RecurringSnapshot } from "@/components/dashboard/recurring-snapshot";
import { SavingsSnapshot } from "@/components/dashboard/savings-snapshot";
import { CanISpend } from "@/components/dashboard/can-i-spend";
import { LayoutDashboard, Plus } from "lucide-react";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import {
  HeadlineCardsSkeleton,
  DashboardSnapshotSkeleton,
} from "@/components/ui/loading-skeletons";
import Link from "next/link";

const Dashboard = () => {
  const {
    data: summary,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryFn: () => getSummary(),
    queryKey: ["summary"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6">
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
        <HeadlineCardsSkeleton />
        <DashboardSnapshotSkeleton />
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        message="We couldn't load your financial data. Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  // Extracting data
  const income = Number(summary.income.totalIncome);
  const recurring = Number(summary.recurring.totals.total);
  const oneTime = Number(summary.oneTime.totalOneTimeTransactions);
  const totalSavings = Number(summary.savings.totalRequiredSavings);
  const remaining = Number(summary.savings.remainingAfterSavings);

  // Check if user has any data
  const hasNoData =
    summary.income.incomeCount === 0 &&
    summary.recurring.counts.bills === 0 &&
    summary.recurring.counts.subscriptions === 0;

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

  if (hasNoData) {
    return (
      <div className="container mx-auto space-y-6">
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

        <EmptyState
          icon={LayoutDashboard}
          title="Welcome to Subtrack!"
          description="Get started by adding your income sources and recurring expenses. This will help you track your finances and see how much you can safely spend."
          iconClassName="bg-primary/20 dark:bg-primary/10"
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/income" className="block">
            <div className="group overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-emerald-500/50 hover:shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 transition-transform group-hover:scale-110">
                <Plus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold">Add Income</h3>
              <p className="text-sm text-muted-foreground">
                Start by adding your salary or other income sources
              </p>
            </div>
          </Link>
          <Link href="/dashboard/recurring" className="block">
            <div className="group overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-blue-500/50 hover:shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 transition-transform group-hover:scale-110">
                <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold">Add Bills</h3>
              <p className="text-sm text-muted-foreground">
                Track recurring bills and subscriptions
              </p>
            </div>
          </Link>
          <Link href="/dashboard/savings" className="block">
            <div className="group overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-teal-500/50 hover:shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/20 transition-transform group-hover:scale-110">
                <Plus className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="font-semibold">Set Goals</h3>
              <p className="text-sm text-muted-foreground">
                Create savings goals for your future
              </p>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
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
