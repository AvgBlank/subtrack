"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Target } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

type SavingsGoal = {
  id: string;
  name: string;
  progressPercentage: number;
  requiredMonthlyContribution: number;
  monthsRemaining: number;
};

type SavingsSnapshotProps = {
  goals: SavingsGoal[];
  totalRequiredSavings: number;
};

function getStatus(goal: SavingsGoal): {
  label: string;
  color: string;
} {
  // Goal already completed
  if (goal.progressPercentage >= 100) {
    return { label: "On track", color: "text-green-600 dark:text-green-400" };
  }

  // Deadline has passed without reaching goal
  if (goal.monthsRemaining <= 0) {
    return { label: "At risk", color: "text-red-600 dark:text-red-400" };
  }

  // Calculate required monthly progress percentage
  const remainingPercentage = 100 - goal.progressPercentage;
  const requiredMonthlyProgress = remainingPercentage / goal.monthsRemaining;

  // If need more than ~15% per month, it's at-risk
  // If need between 8-15% per month, it's tight
  // Otherwise, on-track
  if (requiredMonthlyProgress > 15) {
    return { label: "At risk", color: "text-red-600 dark:text-red-400" };
  } else if (requiredMonthlyProgress > 8) {
    return { label: "Tight", color: "text-yellow-600 dark:text-yellow-400" };
  } else {
    return { label: "On track", color: "text-green-600 dark:text-green-400" };
  }
}

function SavingsGoalItem({ goal }: { goal: SavingsGoal }) {
  const status = getStatus(goal);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium">{goal.name}</span>
        <span className={`text-xs font-medium ${status.color}`}>
          {status.label}
        </span>
      </div>
      <Progress value={Math.min(goal.progressPercentage, 100)} />
      <div className="text-muted-foreground flex justify-between text-xs">
        <span>
          {formatCurrency(goal.requiredMonthlyContribution)}/mo required
        </span>
        <span>
          {goal.monthsRemaining > 0
            ? `${goal.monthsRemaining} months left`
            : "Target reached!"}
        </span>
      </div>
    </div>
  );
}

export function SavingsSnapshot({
  goals,
  totalRequiredSavings,
}: SavingsSnapshotProps) {
  return (
    <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 shadow-sm backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
      <CardHeader className="pt-2 [.border-b]:pb-2 flex flex-row items-center justify-between border-b border-border/50 bg-white/50 dark:bg-black/20">
        <div className="flex items-center gap-2">
          <Target className="text-muted-foreground h-5 w-5" />
          <div>
            <CardTitle>Savings Goals</CardTitle>
            <p className="text-muted-foreground text-sm">
              {formatCurrency(totalRequiredSavings)}/mo required
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/savings">Manage goals</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No savings goals yet. Create one to start tracking your progress!
          </p>
        ) : (
          <div className="space-y-6">
            {goals.map((goal) => (
              <SavingsGoalItem key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
