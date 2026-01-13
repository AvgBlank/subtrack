"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAnalyticsData } from "@/lib/api/analytics";
import { getSummary } from "@/lib/api/summary";
import { AnalyticsControls } from "@/components/analytics/analytics-controls";
import { CashflowTrendChart } from "@/components/analytics/cashflow-trend-chart";
import { ExpenseCompositionChart } from "@/components/analytics/expense-composition-chart";
import { CategoryTrendsChart } from "@/components/analytics/category-trends-chart";
import { SavingsTrendChart } from "@/components/analytics/savings-trend-chart";
import { ExpenseBreakdownPie } from "@/components/analytics/expense-breakdown-pie";
import { CategoryPieChart } from "@/components/analytics/category-pie-chart";
import { CurrentMonthStats } from "@/components/analytics/current-month-stats";
import { MonthComparisonRadar } from "@/components/analytics/month-comparison-radar";
import { BarChart3, AlertCircle } from "lucide-react";

type TimeRange = 3 | 6 | 12;

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>(6);

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["analytics", timeRange],
    queryFn: () => getAnalyticsData(timeRange),
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["summary"],
    queryFn: () => getSummary(),
  });

  const isLoading = analyticsLoading || summaryLoading;

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

  if (!analyticsData || !summary) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 dark:bg-red-500/10">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-muted-foreground">Failed to load analytics data</p>
      </div>
    );
  }

  const totalRequiredSavings = Number(summary.savings.totalRequiredSavings);

  const currentMonth = analyticsData.months[analyticsData.months.length - 1];
  const previousMonth =
    analyticsData.months.length > 1
      ? analyticsData.months[analyticsData.months.length - 2]
      : null;

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/20 dark:bg-violet-500/10">
            <BarChart3 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Trends and spending patterns
            </p>
          </div>
        </div>
        <AnalyticsControls
          selectedRange={timeRange}
          onRangeChange={setTimeRange}
        />
      </div>

      <CurrentMonthStats
        currentMonth={currentMonth}
        previousMonth={previousMonth}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ExpenseBreakdownPie
          bills={currentMonth.bills}
          subscriptions={currentMonth.subscriptions}
          oneTime={currentMonth.oneTime}
        />
        <CategoryPieChart
          categoryTotals={analyticsData.currentMonthCategories}
          title="Category Breakdown"
          subtitle={`${currentMonth.label}`}
        />
        <MonthComparisonRadar
          currentMonth={currentMonth}
          previousMonth={previousMonth}
        />
      </div>

      <div className="space-y-6">
        <CashflowTrendChart data={analyticsData.months} />

        <ExpenseCompositionChart data={analyticsData.months} />

        <CategoryTrendsChart
          data={analyticsData.months}
          categoryTotals={analyticsData.categoryTotals}
        />

        <SavingsTrendChart
          data={analyticsData.months}
          totalRequiredSavings={totalRequiredSavings}
        />
      </div>
    </div>
  );
}
