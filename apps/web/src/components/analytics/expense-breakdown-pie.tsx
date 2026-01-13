"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieChartIcon } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { formatCurrency } from "@/lib/formatCurrency";
import { useTheme } from "next-themes";

type ExpenseBreakdownPieProps = {
  bills: number;
  subscriptions: number;
  oneTime: number;
};

const COLORS = ["#f97316", "#8b5cf6", "#06b6d4"];

export function ExpenseBreakdownPie({
  bills,
  subscriptions,
  oneTime,
}: ExpenseBreakdownPieProps) {
  const { resolvedTheme } = useTheme();
  const labelColor = resolvedTheme === "dark" ? "#fafafa" : "#18181b";

  const data = [
    { name: "Bills", value: bills },
    { name: "Subscriptions", value: subscriptions },
    { name: "One-time", value: oneTime },
  ].filter((d) => d.value > 0);

  const total = bills + subscriptions + oneTime;

  if (total === 0) {
    return (
      <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 shadow-sm backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
        <CardHeader className="pt-2 [.border-b]:pb-2 border-b border-border/50 bg-white/50 dark:bg-black/20">
          <div className="flex items-center gap-2">
            <PieChartIcon className="text-muted-foreground h-5 w-5" />
            <CardTitle>Expense Breakdown</CardTitle>
          </div>
          <p className="text-muted-foreground text-sm">This month</p>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">No expenses this month</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 shadow-sm backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
      <CardHeader className="pt-2 [.border-b]:pb-2 flex flex-col justify-center border-b border-border/50 bg-white/50 dark:bg-black/20">
        <div className="flex items-center gap-2">
          <PieChartIcon className="text-muted-foreground h-5 w-5" />
          <CardTitle>Expense Breakdown</CardTitle>
        </div>
        <p className="text-muted-foreground text-sm">This month</p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent, x, y }) => (
                  <text
                    x={x}
                    y={y}
                    fill={labelColor}
                    fontSize={12}
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {`${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  </text>
                )}
                labelLine={false}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value) => formatCurrency(Number(value))}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-center">
          <p className="text-muted-foreground text-sm">Total Expenses</p>
          <p className="text-2xl font-bold">{formatCurrency(total)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
