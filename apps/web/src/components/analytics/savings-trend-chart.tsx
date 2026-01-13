"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { MonthData } from "@/lib/api/analytics";
import { formatCurrency } from "@/lib/formatCurrency";
import { useTheme } from "next-themes";

type SavingsTrendChartProps = {
  data: MonthData[];
  totalRequiredSavings: number;
};

export function SavingsTrendChart({
  data,
  totalRequiredSavings,
}: SavingsTrendChartProps) {
  const { resolvedTheme } = useTheme();
  const tickColor = resolvedTheme === "dark" ? "#a1a1aa" : "#71717a";
  const gridColor = resolvedTheme === "dark" ? "#27272a" : "#e4e4e7";

  // Show net cashflow (available for savings) vs required savings line
  const chartData = data.map((month) => ({
    name: month.label,
    "Available Cash": month.netCashFlow,
    "Required Savings": totalRequiredSavings,
    Surplus: Math.max(0, month.netCashFlow - totalRequiredSavings),
    Shortfall: Math.max(0, totalRequiredSavings - month.netCashFlow),
  }));

  return (
    <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 shadow-sm backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
      <CardHeader className="pt-2 [.border-b]:pb-2 border-b border-border/50 bg-white/50 dark:bg-black/20">
        <div className="flex items-center gap-2">
          <Target className="text-muted-foreground h-5 w-5" />
          <CardTitle>Savings Capacity</CardTitle>
        </div>
        <p className="text-muted-foreground text-sm">
          Can you meet your savings goals each month?
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
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
              <ReferenceLine
                y={totalRequiredSavings}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: "Required",
                  position: "right",
                  fill: "#f59e0b",
                  fontSize: 12,
                }}
              />
              <defs>
                <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="Available Cash"
                stroke="#6366f1"
                fill="url(#cashGradient)"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-indigo-500" />
            <span className="text-muted-foreground">Available cash</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 border-t-2 border-dashed border-amber-500" />
            <span className="text-muted-foreground">
              Required savings ({formatCurrency(totalRequiredSavings)}/mo)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
