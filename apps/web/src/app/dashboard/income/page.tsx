"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { IncomeTable, type Income } from "@/components/income/income-table";
import { AddEditIncomeModal } from "@/components/income/add-edit-income-modal";
import { getIncomes, toggleIncomeStatus } from "@/lib/api/income";
import { getSummary } from "@/lib/api/summary";
import { toast } from "sonner";
import { Plus, IndianRupee, Users, TrendingUp } from "lucide-react";
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
  const netCashFlow = Number(summary?.cashFlow.netCashFlow ?? 0);

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
      <div className="flex min-h-[60vh] items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="animate-spin fill-foreground"
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
    <div className="container mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 dark:bg-emerald-500/10">
            <IndianRupee className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Income</h1>
            <p className="text-sm text-muted-foreground">
              Money credited to your account
            </p>
          </div>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Income
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 p-4 shadow-sm backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Monthly Income</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10">
              <IndianRupee className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {incomeCount} active source{incomeCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 p-4 shadow-sm backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Income Sources</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{incomes.length}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {activeIncomes.length} active, {inactiveCount} inactive
          </p>
        </div>
        <div className="overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 p-4 shadow-sm backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Net Cash Flow</p>
              <p
                className={`text-2xl font-bold ${
                  netCashFlow >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(netCashFlow)}
              </p>
            </div>
            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${netCashFlow >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
              <TrendingUp className={`h-4 w-4 ${netCashFlow >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`} />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">After all expenses</p>
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
