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
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="animate-spin fill-black dark:fill-white"
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
      <div className="flex h-full items-center justify-center">
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
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Trends and spending patterns
          </p>
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
