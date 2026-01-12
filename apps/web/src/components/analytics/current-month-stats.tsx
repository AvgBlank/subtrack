"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CreditCard,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import type { MonthData } from "@/lib/api/analytics";

type CurrentMonthStatsProps = {
  currentMonth: MonthData;
  previousMonth: MonthData | null;
};

function StatCard({
  title,
  value,
  previousValue,
  icon: Icon,
  colorClass,
  invertTrend = false,
}: {
  title: string;
  value: number;
  previousValue: number | null;
  icon: React.ElementType;
  colorClass: string;
  invertTrend?: boolean;
}) {
  const change =
    previousValue !== null
      ? ((value - previousValue) / previousValue) * 100
      : null;
  const isPositive = change !== null && change > 0;
  const isNegative = change !== null && change < 0;

  // For expenses, positive change is bad (inverted)
  const trendIsGood = invertTrend ? isNegative : isPositive;
  const trendIsBad = invertTrend ? isPositive : isNegative;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-sm">{title}</p>
            <p className={`text-2xl font-bold ${colorClass}`}>
              {formatCurrency(value)}
            </p>
          </div>
          <div className={`rounded-full p-2 ${colorClass} bg-opacity-10`}>
            <Icon className={`h-5 w-5 ${colorClass}`} />
          </div>
        </div>
        {change !== null && (
          <div className="mt-2 flex items-center gap-1 text-sm">
            {trendIsGood ? (
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            ) : trendIsBad ? (
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            ) : (
              <Minus className="h-4 w-4 text-gray-500" />
            )}
            <span
              className={
                trendIsGood
                  ? "text-green-500"
                  : trendIsBad
                    ? "text-red-500"
                    : "text-muted-foreground"
              }
            >
              {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CurrentMonthStats({
  currentMonth,
  previousMonth,
}: CurrentMonthStatsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">This Month</h2>
        <span className="text-muted-foreground text-sm">
          ({currentMonth.label})
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Income"
          value={currentMonth.income}
          previousValue={previousMonth?.income ?? null}
          icon={IndianRupee}
          colorClass="text-green-600 dark:text-green-400"
        />
        <StatCard
          title="Total Expenses"
          value={currentMonth.totalExpenses}
          previousValue={previousMonth?.totalExpenses ?? null}
          icon={CreditCard}
          colorClass="text-red-600 dark:text-red-400"
          invertTrend
        />
        <StatCard
          title="Net Cashflow"
          value={currentMonth.netCashFlow}
          previousValue={previousMonth?.netCashFlow ?? null}
          icon={currentMonth.netCashFlow >= 0 ? TrendingUp : TrendingDown}
          colorClass={
            currentMonth.netCashFlow >= 0
              ? "text-blue-600 dark:text-blue-400"
              : "text-red-600 dark:text-red-400"
          }
        />
        <StatCard
          title="One-time Expenses"
          value={currentMonth.oneTime}
          previousValue={previousMonth?.oneTime ?? null}
          icon={PiggyBank}
          colorClass="text-cyan-600 dark:text-cyan-400"
          invertTrend
        />
      </div>
    </div>
  );
}
