"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
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

type ExpenseCompositionChartProps = {
  data: MonthData[];
};

export function ExpenseCompositionChart({
  data,
}: ExpenseCompositionChartProps) {
  const { resolvedTheme } = useTheme();
  const tickColor = resolvedTheme === "dark" ? "#a1a1aa" : "#71717a";
  const gridColor = resolvedTheme === "dark" ? "#27272a" : "#e4e4e7";

  const chartData = data.map((month) => ({
    name: month.label,
    Bills: month.bills,
    Subscriptions: month.subscriptions,
    "One-time": month.oneTime,
  }));

  return (
    <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 shadow-sm backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
      <CardHeader className="pt-2 [.border-b]:pb-2 border-b border-border/50 bg-white/50 dark:bg-black/20">
        <div className="flex items-center gap-2">
          <BarChart3 className="text-muted-foreground h-5 w-5" />
          <CardTitle>Expense Composition</CardTitle>
        </div>
        <p className="text-muted-foreground text-sm">
          What&apos;s driving your expenses each month
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
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
              <Bar
                dataKey="Bills"
                stackId="expenses"
                fill="#f97316"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="Subscriptions"
                stackId="expenses"
                fill="#a855f7"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="One-time"
                stackId="expenses"
                fill="#14b8a6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
