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
import { BarChart3 } from "lucide-react";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { AnalyticsPageSkeleton } from "@/components/ui/loading-skeletons";

type TimeRange = 3 | 6 | 12;

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>(6);

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ["analytics", timeRange],
    queryFn: () => getAnalyticsData(timeRange),
  });

  const {
    data: summary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["summary"],
    queryFn: () => getSummary(),
  });

  const isLoading = analyticsLoading || summaryLoading;

  // Page header component
  const pageHeader = (
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
  );

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6">
        {pageHeader}
        <AnalyticsPageSkeleton />
      </div>
    );
  }

  if (!analyticsData || !summary) {
    return (
      <div className="container mx-auto space-y-6">
        {pageHeader}
        <ErrorState
          title="Failed to load analytics"
          message="We couldn't load your analytics data. Please try again."
          onRetry={() => {
            refetchAnalytics();
            refetchSummary();
          }}
          className="min-h-[40vh]"
        />
      </div>
    );
  }

  // Check if not enough data for analytics
  if (analyticsData.months.length < 2) {
    return (
      <div className="container mx-auto space-y-6">
        {pageHeader}
        <EmptyState
          icon={BarChart3}
          title="Not enough data yet"
          description="Analytics require at least 2 months of data. Keep tracking your finances and check back soon for insights and trends."
          iconClassName="bg-violet-500/20 dark:bg-violet-500/10"
        />
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
      {pageHeader}

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
