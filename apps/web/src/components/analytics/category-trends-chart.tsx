"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "lucide-react";
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
import type { MonthData, CategoryTotal } from "@/lib/api/analytics";
import { formatCurrency } from "@/lib/formatCurrency";
import { useTheme } from "next-themes";

type CategoryTrendsChartProps = {
  data: MonthData[];
  categoryTotals: CategoryTotal[];
};

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#14b8a6"];

export function CategoryTrendsChart({
  data,
  categoryTotals,
}: CategoryTrendsChartProps) {
  const { resolvedTheme } = useTheme();
  const tickColor = resolvedTheme === "dark" ? "#a1a1aa" : "#71717a";
  const gridColor = resolvedTheme === "dark" ? "#27272a" : "#e4e4e7";

  // Get top 5 categories
  const topCategories = categoryTotals.slice(0, 5).map((c) => c.category);

  // Transform data for stacked bar chart
  const chartData = data.map((month) => {
    const result: Record<string, string | number> = { name: month.label };
    let otherTotal = 0;

    for (const [category, amount] of Object.entries(month.categorySummary)) {
      if (topCategories.includes(category)) {
        result[category] = amount;
      } else {
        otherTotal += amount;
      }
    }

    // Add "Other" if there are categories beyond top 5
    if (otherTotal > 0) {
      result["Other"] = otherTotal;
    }

    return result;
  });

  // Include "Other" in categories if present in any month
  const hasOther = chartData.some((d) => d["Other"] !== undefined);
  const categories = hasOther ? [...topCategories, "Other"] : topCategories;
  const colors = hasOther ? [...COLORS, "#6b7280"] : COLORS;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <PieChart className="text-muted-foreground h-5 w-5" />
          <CardTitle>Category Trends</CardTitle>
        </div>
        <p className="text-muted-foreground text-sm">
          Top spending categories over time
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
              {categories.map((category, index) => (
                <Bar
                  key={category}
                  dataKey={category}
                  stackId="categories"
                  fill={colors[index]}
                  radius={
                    index === categories.length - 1
                      ? [4, 4, 0, 0]
                      : [0, 0, 0, 0]
                  }
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
