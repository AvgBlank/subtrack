"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/formatCurrency";
import type { CategoryTotal } from "@/lib/api/analytics";
import { useTheme } from "next-themes";

type CategoryPieChartProps = {
  categoryTotals: CategoryTotal[];
  title?: string;
  subtitle?: string;
};

const COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f97316",
  "#8b5cf6",
  "#ec4899",
  "#6b7280",
];

export function CategoryPieChart({
  categoryTotals,
  title = "Spending by Category",
  subtitle = "Current month",
}: CategoryPieChartProps) {
  const { resolvedTheme } = useTheme();
  const labelColor = resolvedTheme === "dark" ? "#fafafa" : "#18181b";

  // Get top 5 + Other
  const top5 = categoryTotals.slice(0, 5);
  const otherTotal = categoryTotals
    .slice(5)
    .reduce((sum, c) => sum + c.total, 0);

  const data = [
    ...top5.map((c) => ({ name: c.category, value: c.total })),
    ...(otherTotal > 0 ? [{ name: "Other", value: otherTotal }] : []),
  ].filter((d) => d.value > 0);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="text-muted-foreground h-5 w-5" />
            <CardTitle>{title}</CardTitle>
          </div>
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Layers className="text-muted-foreground h-5 w-5" />
          <CardTitle>{title}</CardTitle>
        </div>
        <p className="text-muted-foreground text-sm">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent, x, y }) =>
                  (percent ?? 0) > 0.05 ? (
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
                  ) : null
                }
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
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-muted-foreground truncate">
                {item.name}
              </span>
              <span className="ml-auto font-medium">
                {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
