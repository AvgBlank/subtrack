"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { IncomeTable, type Income } from "@/components/income/income-table";
import { AddEditIncomeModal } from "@/components/income/add-edit-income-modal";
import { getIncomes, toggleIncomeStatus } from "@/lib/api/income";
import { getSummary } from "@/lib/api/summary";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

export default function IncomePage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data: incomes = [], isLoading: incomesLoading } = useQuery({
    queryKey: ["income"],
    queryFn: getIncomes,
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["summary"],
    queryFn: () => getSummary(),
  });

  const isLoading = incomesLoading || summaryLoading;

  // Get data from summary
  const totalIncome = Number(summary?.income.totalIncome ?? 0);
  const incomeCount = summary?.income.incomeCount ?? 0;
  const activeIncomes = incomes.filter((i) => i.isActive);
  const inactiveCount = incomes.length - activeIncomes.length;

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleIncomeStatus(id, isActive),
    onMutate: ({ id }) => {
      setTogglingId(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      toast.success("Status updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update");
    },
    onSettled: () => {
      setTogglingId(null);
    },
  });

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingIncome(null);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["income"] });
    queryClient.invalidateQueries({ queryKey: ["summary"] });
  };

  const handleToggleStatus = (id: string, isActive: boolean) => {
    toggleMutation.mutate({ id, isActive });
  };

  if (isLoading) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Income</h1>
          <p className="text-muted-foreground text-sm">
            Money credited to your account
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add income
        </Button>
      </div>

      {/* Summary Tiles */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-muted-foreground text-sm">Total Monthly Income</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(totalIncome)}
          </p>
          <p className="text-muted-foreground text-xs">
            {incomeCount} active source{incomeCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-muted-foreground text-sm">Income Sources</p>
          <p className="text-2xl font-bold">{incomes.length}</p>
          <p className="text-muted-foreground text-xs">
            {activeIncomes.length} active, {inactiveCount} inactive
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-muted-foreground text-sm">Net Cash Flow</p>
          <p className={`text-2xl font-bold ${
            Number(summary?.cashFlow.netCashFlow ?? 0) >= 0
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}>
            {formatCurrency(Number(summary?.cashFlow.netCashFlow ?? 0))}
          </p>
          <p className="text-muted-foreground text-xs">After all expenses</p>
        </div>
      </div>

      <IncomeTable
        incomes={incomes}
        onEditAction={handleEdit}
        onToggleStatusAction={handleToggleStatus}
        isToggling={togglingId}
      />
      <AddEditIncomeModal
        open={modalOpen}
        onOpenChangeAction={setModalOpen}
        income={editingIncome}
        onSuccessAction={handleSuccess}
      />
    </div>
  );
}
