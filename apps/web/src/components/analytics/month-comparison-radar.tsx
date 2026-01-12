"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { MonthData } from "@/lib/api/analytics";
import { useTheme } from "next-themes";

type MonthComparisonRadarProps = {
  currentMonth: MonthData;
  previousMonth: MonthData | null;
};

export function MonthComparisonRadar({
  currentMonth,
  previousMonth,
}: MonthComparisonRadarProps) {
  const { resolvedTheme } = useTheme();
  const tickColor = resolvedTheme === "dark" ? "#a1a1aa" : "#71717a";
  const gridColor = resolvedTheme === "dark" ? "#27272a" : "#e4e4e7";

  // Normalize values for radar chart (as percentage of max)
  const maxIncome = Math.max(
    currentMonth.income,
    previousMonth?.income ?? 0,
    1,
  );
  const maxExpenses = Math.max(
    currentMonth.totalExpenses,
    previousMonth?.totalExpenses ?? 0,
    1,
  );
  const maxBills = Math.max(currentMonth.bills, previousMonth?.bills ?? 0, 1);
  const maxSubs = Math.max(
    currentMonth.subscriptions,
    previousMonth?.subscriptions ?? 0,
    1,
  );
  const maxOneTime = Math.max(
    currentMonth.oneTime,
    previousMonth?.oneTime ?? 0,
    1,
  );

  const data = [
    {
      subject: "Income",
      current: (currentMonth.income / maxIncome) * 100,
      previous: previousMonth ? (previousMonth.income / maxIncome) * 100 : 0,
    },
    {
      subject: "Bills",
      current: (currentMonth.bills / maxBills) * 100,
      previous: previousMonth ? (previousMonth.bills / maxBills) * 100 : 0,
    },
    {
      subject: "Subscriptions",
      current: (currentMonth.subscriptions / maxSubs) * 100,
      previous: previousMonth
        ? (previousMonth.subscriptions / maxSubs) * 100
        : 0,
    },
    {
      subject: "One-time",
      current: (currentMonth.oneTime / maxOneTime) * 100,
      previous: previousMonth ? (previousMonth.oneTime / maxOneTime) * 100 : 0,
    },
    {
      subject: "Total Spend",
      current: (currentMonth.totalExpenses / maxExpenses) * 100,
      previous: previousMonth
        ? (previousMonth.totalExpenses / maxExpenses) * 100
        : 0,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="text-muted-foreground h-5 w-5" />
          <CardTitle>Month Comparison</CardTitle>
        </div>
        <p className="text-muted-foreground text-sm">
          {currentMonth.label} vs {previousMonth?.label ?? "N/A"}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid stroke={gridColor} />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: tickColor, fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: tickColor, fontSize: 10 }}
              />
              {previousMonth && (
                <Radar
                  name={previousMonth.label}
                  dataKey="previous"
                  stroke="#94a3b8"
                  fill="#94a3b8"
                  fillOpacity={0.2}
                />
              )}
              <Radar
                name={currentMonth.label}
                dataKey="current"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
