"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  RecurringTable,
  type RecurringTransaction,
} from "@/components/recurring/recurring-table";
import { AddEditRecurringModal } from "@/components/recurring/add-edit-recurring-modal";
import {
  getRecurringTransactions,
  toggleRecurringStatus,
} from "@/lib/api/recurring";
import { toast } from "sonner";
import { Plus, Receipt, CreditCard } from "lucide-react";

type ViewType = "BILL" | "SUBSCRIPTION";

export default function RecurringPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<RecurringTransaction | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>("BILL");

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["recurring"],
    queryFn: getRecurringTransactions,
  });

  // Split transactions by type
  const bills = useMemo(
    () => transactions.filter((t) => t.type === "BILL"),
    [transactions],
  );
  const subscriptions = useMemo(
    () => transactions.filter((t) => t.type === "SUBSCRIPTION"),
    [transactions],
  );

  const activeTransactions = activeView === "BILL" ? bills : subscriptions;

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleRecurringStatus(id, isActive),
    onMutate: ({ id }) => {
      setTogglingId(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
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

  const handleEdit = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingTransaction(null);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["recurring"] });
    queryClient.invalidateQueries({ queryKey: ["summary"] });
  };

  const handleToggleStatus = (id: string, isActive: boolean) => {
    toggleMutation.mutate({ id, isActive });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded mt-2" />
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-96 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Recurring</h1>
          <p className="text-muted-foreground text-sm">
            Monthly commitments & subscriptions
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add recurring
        </Button>
      </div>

      <div className="mb-6">
        <div className="inline-flex rounded-lg bg-muted p-1">
          <button
            onClick={() => setActiveView("BILL")}
            className={`
              inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors
              ${
                activeView === "BILL"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Receipt className="h-4 w-4" />
            Bills
            <span
              className={`
              ml-1 rounded-full px-2 py-0.5 text-xs
              ${
                activeView === "BILL"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted-foreground/20"
              }`}
            >
              {bills.length}
            </span>
          </button>
          <button
            onClick={() => setActiveView("SUBSCRIPTION")}
            className={`
              inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors
              ${
                activeView === "SUBSCRIPTION"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <CreditCard className="h-4 w-4" />
            Subscriptions
            <span
              className={`
              ml-1 rounded-full px-2 py-0.5 text-xs
              ${
                activeView === "SUBSCRIPTION"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted-foreground/20"
              }`}
            >
              {subscriptions.length}
            </span>
          </button>
        </div>
      </div>

      <RecurringTable
        transactions={activeTransactions}
        onEditAction={handleEdit}
        onToggleStatusAction={handleToggleStatus}
        isToggling={togglingId}
      />

      <AddEditRecurringModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        transaction={editingTransaction}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
