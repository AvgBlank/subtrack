"use client";

import { Button } from "@/components/ui/button";

type TimeRange = 3 | 6 | 12;

type AnalyticsControlsProps = {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
};

export function AnalyticsControls({
  selectedRange,
  onRangeChange,
}: AnalyticsControlsProps) {
  const ranges: { value: TimeRange; label: string }[] = [
    { value: 3, label: "3 months" },
    { value: 6, label: "6 months" },
    { value: 12, label: "12 months" },
  ];

  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
      {ranges.map((range) => (
        <Button
          key={range.value}
          variant={selectedRange === range.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onRangeChange(range.value)}
          className={
            selectedRange === range.value
              ? ""
              : "text-muted-foreground hover:text-foreground"
          }
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
}
