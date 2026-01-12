"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { IncomeTable, type Income } from "@/components/income/income-table";
import { AddEditIncomeModal } from "@/components/income/add-edit-income-modal";
import { getIncomes, toggleIncomeStatus } from "@/lib/api/income";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function IncomePage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data: incomes = [], isLoading } = useQuery({
    queryKey: ["income"],
    queryFn: getIncomes,
  });

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
