"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SavingsGoalCard } from "@/components/savings/savings-goal-card";
import { AddEditSavingsGoalModal } from "@/components/savings/add-edit-savings-goal-modal";
import { getSavingsGoals, deleteSavingsGoal } from "@/lib/api/savings";
import { getSummary } from "@/lib/api/summary";
import type { SavingsGoal } from "@/lib/api/savings";
import {
  Plus,
  Target,
  Loader2,
  PiggyBank,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import { toast } from "sonner";
import { ErrorState } from "@/components/ui/error-state";
import { SavingsGoalsSkeleton } from "@/components/ui/loading-skeletons";

export default function SavingsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<SavingsGoal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: goals = [],
    isLoading: goalsLoading,
    error: goalsError,
    refetch: refetchGoals,
  } = useQuery({
    queryKey: ["savings"],
    queryFn: getSavingsGoals,
  });

  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["summary"],
    queryFn: () => getSummary(),
  });

  const isLoading = goalsLoading || summaryLoading;
  const hasError = goalsError || summaryError;

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingGoal(null);
    setModalOpen(true);
  };

  const handleDeleteClick = (goal: SavingsGoal) => {
    setDeletingGoal(goal);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGoal) return;
    setIsDeleting(true);

    try {
      await deleteSavingsGoal(deletingGoal.id);
      toast.success("Goal deleted");
      queryClient.invalidateQueries({ queryKey: ["savings"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    } finally {
      setIsDeleting(false);
      setDeletingGoal(null);
    }
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["savings"] });
    queryClient.invalidateQueries({ queryKey: ["summary"] });
  };

  // Page header component
  const pageHeader = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/20 dark:bg-teal-500/10">
          <Target className="h-5 w-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Savings</h1>
          <p className="text-sm text-muted-foreground">Your financial goals</p>
        </div>
      </div>
      <Button onClick={handleAdd} className="gap-2">
        <Plus className="h-4 w-4" />
        Add Goal
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6">
        {pageHeader}
        <SavingsGoalsSkeleton />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="container mx-auto space-y-6">
        {pageHeader}
        <ErrorState
          title="Failed to load savings"
          message="We couldn't load your savings goals. Please try again."
          onRetry={() => {
            refetchGoals();
            refetchSummary();
          }}
        />
      </div>
    );
  }

  // Extract summary data
  const totalRequiredSavings = Number(
    summary?.savings.totalRequiredSavings ?? 0,
  );
  const totalAvailableCash = Number(summary?.savings.totalAvailableCash ?? 0);
  const remainingAfterSavings = Number(
    summary?.savings.remainingAfterSavings ?? 0,
  );
  const isRemainingNegative = remainingAfterSavings < 0;

  return (
    <div className="container mx-auto space-y-6">
      {pageHeader}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 p-4 shadow-sm backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Required Savings / Month
              </p>
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {formatCurrency(totalRequiredSavings)}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/10">
              <PiggyBank className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {goals.length} active goal{goals.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 p-4 shadow-sm backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Available Cash / Month
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(totalAvailableCash)}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10">
              <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">After expenses</p>
        </div>
        <div className="overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 p-4 shadow-sm backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Remaining After Savings
              </p>
              <p
                className={`text-2xl font-bold ${
                  isRemainingNegative
                    ? "text-red-600 dark:text-red-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {formatCurrency(remainingAfterSavings)}
              </p>
            </div>
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full ${isRemainingNegative ? "bg-red-500/10" : "bg-emerald-500/10"}`}
            >
              <TrendingUp
                className={`h-4 w-4 ${isRemainingNegative ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {isRemainingNegative
              ? "You need more income"
              : "Available to spend"}
          </p>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 py-16 backdrop-blur-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/20 dark:bg-teal-500/10">
            <Target className="h-8 w-8 text-teal-600 dark:text-teal-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">
            You haven&apos;t set any savings goals yet.
          </h3>
          <p className="mb-6 max-w-md text-center text-sm text-muted-foreground">
            Savings goals help you decide what you can safely spend. Set a goal
            to start tracking your progress toward financial milestones.
          </p>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Create your first goal
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              onEditAction={handleEdit}
              onDeleteAction={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <AddEditSavingsGoalModal
        open={modalOpen}
        onOpenChangeAction={setModalOpen}
        goal={editingGoal}
        onSuccessAction={handleSuccess}
      />

      <Dialog
        open={!!deletingGoal}
        onOpenChange={(open) => !open && setDeletingGoal(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete savings goal?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingGoal?.name}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingGoal(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
