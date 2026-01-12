"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import type { SavingsGoal } from "@/lib/api/savings";

type SavingsGoalCardProps = {
  goal: SavingsGoal;
  onEditAction: (goal: SavingsGoal) => void;
  onDeleteAction: (goal: SavingsGoal) => void;
};

const statusConfig = {
  "on-track": {
    label: "On track",
    variant: "default",
    className:
      "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20",
  },
  tight: {
    label: "Tight",
    variant: "secondary",
    className:
      "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20",
  },
  "at-risk": {
    label: "At risk",
    variant: "destructive",
    className:
      "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20",
  },
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

export function SavingsGoalCard({
  goal,
  onEditAction,
  onDeleteAction,
}: SavingsGoalCardProps) {
  const status = statusConfig[goal.status];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold">{goal.name}</h3>
            <Badge className={status.className}>{status.label}</Badge>
          </div>

          <div className="space-y-2">
            <Progress value={Math.min(goal.progressPercentage, 100)} />
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {formatCurrency(goal.currentAmount)}
              </span>
              <span className="text-muted-foreground">
                of {formatCurrency(goal.targetAmount)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-2xl font-bold">
                {formatCurrency(goal.requiredMonthlyContribution)}
              </p>
              <p className="text-muted-foreground text-xs">
                Required monthly contribution
              </p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-sm">
                {goal.monthsRemaining > 0
                  ? `${goal.monthsRemaining} months remaining`
                  : "Target date reached"}
              </p>
              <p className="text-muted-foreground text-xs">
                Target: {formatDate(goal.targetDate)}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditAction(goal)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDeleteAction(goal)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
