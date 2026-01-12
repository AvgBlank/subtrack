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
import { Plus, Target, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import { toast } from "sonner";

export default function SavingsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<SavingsGoal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ["savings"],
    queryFn: getSavingsGoals,
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["summary"],
    queryFn: () => getSummary(),
  });

  const isLoading = goalsLoading || summaryLoading;

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

  if (isLoading) {
    return (
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="animate-spin fill-black dark:fill-white"
          width="32"
          height="32"
          viewBox="0 0 256 256"
        >
          <path d="M236,128a108,108,0,0,1-216,0c0-42.52,24.73-81.34,63-98.9A12,12,0,1,1,93,50.91C63.24,64.57,44,94.83,44,128a84,84,0,0,0,168,0c0-33.17-19.24-63.43-49-77.09A12,12,0,1,1,173,29.1C211.27,46.66,236,85.48,236,128Z"></path>
        </svg>
      </div>
    );
  }

  // Extract summary data
  const totalRequiredSavings = Number(summary?.savings.totalRequiredSavings ?? 0);
  const totalAvailableCash = Number(summary?.savings.totalAvailableCash ?? 0);
  const remainingAfterSavings = Number(summary?.savings.remainingAfterSavings ?? 0);
  const isRemainingNegative = remainingAfterSavings < 0;

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Savings</h1>
          <p className="text-muted-foreground text-sm">Your financial goals</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add goal
        </Button>
      </div>

      {/* Summary Strip */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-muted-foreground text-sm">
            Total required savings / month
          </p>
          <p className="text-2xl font-bold">
            {formatCurrency(totalRequiredSavings)}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-muted-foreground text-sm">
            Available cash / month
          </p>
          <p className="text-2xl font-bold">
            {formatCurrency(totalAvailableCash)}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-muted-foreground text-sm">
            Remaining after savings
          </p>
          <p
            className={`text-2xl font-bold ${
              isRemainingNegative
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            {formatCurrency(remainingAfterSavings)}
          </p>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Target className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">
            You haven&apos;t set any savings goals yet.
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md text-center text-sm">
            Savings goals help you decide what you can safely spend. Set a goal
            to start tracking your progress toward financial milestones.
          </p>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
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
