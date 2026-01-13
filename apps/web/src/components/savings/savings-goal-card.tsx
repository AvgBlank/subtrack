"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Target, Calendar, TrendingUp } from "lucide-react";
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
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    progressColor: "bg-emerald-500",
  },
  tight: {
    label: "Tight",
    className:
      "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    progressColor: "bg-yellow-500",
  },
  "at-risk": {
    label: "At risk",
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    progressColor: "bg-red-500",
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
    <div className="overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 shadow-sm backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
      <div className="flex items-center justify-between border-b border-border/50 bg-white/50 p-4 dark:bg-black/20">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/10">
            <Target className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </div>
          <h3 className="font-semibold">{goal.name}</h3>
        </div>
        <Badge variant="outline" className={status.className}>
          {status.label}
        </Badge>
      </div>

      <div className="space-y-3 p-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {formatCurrency(goal.currentAmount)}
            </span>
            <span className="text-muted-foreground">
              of {formatCurrency(goal.targetAmount)}
            </span>
          </div>
          <Progress
            value={Math.min(goal.progressPercentage, 100)}
            className="h-2"
          />
          <p className="text-xs text-muted-foreground text-right">
            {goal.progressPercentage.toFixed(1)}% complete
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Monthly contribution
            </div>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(goal.requiredMonthlyContribution)}
            </p>
          </div>
          <div className="space-y-1 text-right">
            <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Target date
            </div>
            <p className="text-sm font-medium">{formatDate(goal.targetDate)}</p>
            <p className="text-xs text-muted-foreground">
              {goal.monthsRemaining > 0
                ? `${goal.monthsRemaining} months left`
                : "Target reached"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-border/50 bg-white/30 px-4 py-3 dark:bg-black/10">
        <Button variant="ghost" size="sm" onClick={() => onEditAction(goal)}>
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
  );
}
