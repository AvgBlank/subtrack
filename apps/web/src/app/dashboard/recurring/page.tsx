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
import { getSummary } from "@/lib/api/summary";
import { toast } from "sonner";
import { Plus, Receipt, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

type ViewType = "BILL" | "SUBSCRIPTION";

export default function RecurringPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<RecurringTransaction | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>("BILL");

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["recurring"],
    queryFn: getRecurringTransactions,
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["summary"],
    queryFn: () => getSummary(),
  });

  const isLoading = transactionsLoading || summaryLoading;

  // Split transactions by type
  const bills = useMemo(
    () => transactions.filter((t) => t.type === "BILL"),
    [transactions],
  );
  const subscriptions = useMemo(
    () => transactions.filter((t) => t.type === "SUBSCRIPTION"),
    [transactions],
  );

  // Get totals from summary (normalized to monthly)
  const totalMonthly = Number(summary?.recurring.totals.total ?? 0);
  const totalBills = Number(summary?.recurring.totals.bills ?? 0);
  const totalSubscriptions = Number(summary?.recurring.totals.subscriptions ?? 0);
  const billsCount = summary?.recurring.counts.bills ?? 0;
  const subscriptionsCount = summary?.recurring.counts.subscriptions ?? 0;

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

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-muted-foreground text-sm">Total Monthly</p>
          <p className="text-2xl font-bold">{formatCurrency(totalMonthly)}</p>
          <p className="text-muted-foreground text-xs">
            {billsCount + subscriptionsCount} active commitment{billsCount + subscriptionsCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-muted-foreground text-sm">Bills</p>
          <p className="text-2xl font-bold">{formatCurrency(totalBills)}</p>
          <p className="text-muted-foreground text-xs">
            {billsCount} active bill{billsCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-muted-foreground text-sm">Subscriptions</p>
          <p className="text-2xl font-bold">{formatCurrency(totalSubscriptions)}</p>
          <p className="text-muted-foreground text-xs">
            {subscriptionsCount} active subscription{subscriptionsCount !== 1 ? "s" : ""}
          </p>
        </div>
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
        onOpenChangeAction={setModalOpen}
        transaction={editingTransaction}
        onSuccessAction={handleSuccess}
      />
    </div>
  );
}
