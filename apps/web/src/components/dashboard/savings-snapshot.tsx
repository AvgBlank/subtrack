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
};

function getStatus(goal: SavingsGoal): {
  label: string;
  color: string;
} {
  // If progress is ahead of schedule based on months remaining
  const expectedProgress =
    goal.monthsRemaining > 0
      ? 100 - (goal.monthsRemaining / (goal.monthsRemaining + 12)) * 100
      : 100;

  if (goal.progressPercentage >= expectedProgress) {
    return { label: "On track", color: "text-green-600 dark:text-green-400" };
  } else if (goal.progressPercentage >= expectedProgress * 0.7) {
    return { label: "Tight", color: "text-yellow-600 dark:text-yellow-400" };
  } else {
    return { label: "At risk", color: "text-red-600 dark:text-red-400" };
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

export function SavingsSnapshot({ goals }: SavingsSnapshotProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="text-muted-foreground h-5 w-5" />
          <CardTitle>Savings Goals</CardTitle>
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
