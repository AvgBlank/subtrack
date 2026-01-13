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
import { Plus, Receipt, CreditCard, Repeat } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import {
  SummaryCardsSkeleton,
  TableSkeleton,
} from "@/components/ui/loading-skeletons";

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
  const totalSubscriptions = Number(
    summary?.recurring.totals.subscriptions ?? 0,
  );
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

  // Page header component
  const pageHeader = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 dark:bg-blue-500/10">
          <Repeat className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Recurring</h1>
          <p className="text-sm text-muted-foreground">
            Monthly commitments & subscriptions
          </p>
        </div>
      </div>
      <Button onClick={handleAdd} className="gap-2">
        <Plus className="h-4 w-4" />
        Add Recurring
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6">
        {pageHeader}
        <SummaryCardsSkeleton count={3} />
        <TableSkeleton rows={5} columns={8} />
      </div>
    );
  }

  if (!transactions || !summary) {
    return (
      <div className="container mx-auto space-y-6">
        {pageHeader}
        <ErrorState
          title="Failed to load recurring expenses"
          message="We couldn't load your recurring expenses. Please try again."
          onRetry={() => {
            queryClient.invalidateQueries({ queryKey: ["recurring"] });
            queryClient.invalidateQueries({ queryKey: ["summary"] });
          }}
          className="min-h-[40vh]"
        />
      </div>
    );
  }

  // Check if no recurring items
  const hasNoItems = transactions.length === 0;

  if (hasNoItems) {
    return (
      <div className="container mx-auto space-y-6">
        {pageHeader}
        <EmptyState
          icon={Repeat}
          title="No recurring expenses yet"
          description="Add your bills and subscriptions to track monthly commitments. This helps you understand your fixed expenses and plan your budget better."
          actionLabel="Add your first recurring expense"
          onAction={handleAdd}
          iconClassName="bg-blue-500/20 dark:bg-blue-500/10"
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

  return (
    <div className="container mx-auto space-y-6">
      {/* Page Header */}
      {pageHeader}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 p-4 shadow-sm backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Monthly</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(totalMonthly)}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10">
              <Repeat className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {billsCount + subscriptionsCount} active commitment
            {billsCount + subscriptionsCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 p-4 shadow-sm backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Bills</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalBills)}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10">
              <Receipt className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {billsCount} active bill{billsCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 p-4 shadow-sm backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Subscriptions</p>
              <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                {formatCurrency(totalSubscriptions)}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10">
              <CreditCard className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {subscriptionsCount} active subscription
            {subscriptionsCount !== 1 ? "s" : ""}
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
