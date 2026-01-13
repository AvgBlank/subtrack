"use client";

import { Skeleton } from "@/components/ui/skeleton";

// Dashboard page skeletons
export function HeadlineCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 p-4 shadow-sm backdrop-blur-sm"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SummaryCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className={`grid gap-4 md:grid-cols-${count}`}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 p-4 shadow-sm backdrop-blur-sm"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-7 w-24" />
            </div>
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  columns = 6,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="rounded-md border">
      <div className="border-b bg-muted/50 p-4">
        <div className="flex gap-4">
          {[...Array(columns)].map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      <div className="divide-y">
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 p-4">
            {[...Array(columns)].map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className={`h-5 flex-1 ${colIndex === 0 ? "max-w-[200px]" : ""}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const rand = () => {
  return Math.random();
};

export function ChartSkeleton({ height = "h-80" }: { height?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 shadow-sm backdrop-blur-sm">
      <div className="border-b border-border/50 bg-white/50 p-4 dark:bg-black/20">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-1 h-4 w-60" />
      </div>
      <div className={`p-6 ${height}`}>
        <div className="flex h-full items-end gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1"
              style={{ height: `${30 + rand() * 60}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SavingsGoalsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 shadow-sm backdrop-blur-sm"
        >
          <div className="border-b border-border/50 bg-white/50 p-4 dark:bg-black/20">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSnapshotSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 shadow-sm backdrop-blur-sm"
        >
          <div className="border-b border-border/50 bg-white/50 p-4 dark:bg-black/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <div className="divide-y p-0">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="flex items-center justify-between p-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsPageSkeleton() {
  return (
    <div className="container mx-auto space-y-6">
      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 p-4 shadow-sm backdrop-blur-sm"
          >
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-2 h-7 w-24" />
            <Skeleton className="mt-2 h-3 w-16" />
          </div>
        ))}
      </div>
      {/* Charts row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <ChartSkeleton key={i} height="h-64" />
        ))}
      </div>
      {/* Full width charts */}
      <ChartSkeleton height="h-80" />
    </div>
  );
}
