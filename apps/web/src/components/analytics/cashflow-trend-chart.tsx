"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { MonthData } from "@/lib/api/analytics";
import { formatCurrency } from "@/lib/formatCurrency";
import { useTheme } from "next-themes";

type CashflowTrendChartProps = {
  data: MonthData[];
};

export function CashflowTrendChart({ data }: CashflowTrendChartProps) {
  const { resolvedTheme } = useTheme();
  const tickColor = resolvedTheme === "dark" ? "#a1a1aa" : "#71717a";
  const gridColor = resolvedTheme === "dark" ? "#27272a" : "#e4e4e7";

  const chartData = data.map((month) => ({
    name: month.label,
    Income: month.income,
    Expenses: month.totalExpenses,
    "Net Cashflow": month.netCashFlow,
  }));

  return (
    <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 shadow-sm backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
      <CardHeader className="pt-2 [.border-b]:pb-2 border-b border-border/50 bg-white/50 dark:bg-black/20">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-muted-foreground h-5 w-5" />
          <CardTitle>Cashflow Over Time</CardTitle>
        </div>
        <p className="text-muted-foreground text-sm">
          Income, expenses, and net cashflow trends
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 12 }} />
              <YAxis
                tick={{ fill: tickColor, fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value) => formatCurrency(Number(value))}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Income"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Expenses"
                stroke="#f43f5e"
                strokeWidth={2.5}
                dot={{ fill: "#f43f5e", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Net Cashflow"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ fill: "#6366f1", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
