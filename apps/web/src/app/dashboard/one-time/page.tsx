"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  OneTimeTable,
  type OneTimeTransaction,
} from "@/components/one-time/one-time-table";
import { AddEditOneTimeModal } from "@/components/one-time/add-edit-one-time-modal";
import { getOneTimeTransactions } from "@/lib/api/one-time";
import { getSummary } from "@/lib/api/summary";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Calculator,
  Tag,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import {
  SummaryCardsSkeleton,
  TableSkeleton,
} from "@/components/ui/loading-skeletons";

const getMonthName = (month: number): string => {
  const date = new Date(2000, month - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long" });
};

export default function OneTimePage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<OneTimeTransaction | null>(null);

  // Month selector state
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["one-time", selectedMonth, selectedYear],
    queryFn: () => getOneTimeTransactions(selectedMonth, selectedYear),
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["summary", selectedMonth, selectedYear],
    queryFn: () => getSummary(String(selectedMonth), String(selectedYear)),
  });

  const isLoading = transactionsLoading || summaryLoading;

  // Get data from summary
  const monthlyTotal = Number(summary?.oneTime.totalOneTimeTransactions ?? 0);
  const transactionCount = summary?.oneTime.oneTimeTransactionCount ?? 0;
  const categorySummary = summary?.oneTime.categorySummary ?? {};
  const topCategory = Object.entries(categorySummary).sort(
    (a, b) => Number(b[1].totalAmount) - Number(a[1].totalAmount),
  )[0];

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const isCurrentMonth =
    selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear();

  const handleEdit = (transaction: OneTimeTransaction) => {
    setEditingTransaction(transaction);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingTransaction(null);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: ["one-time", selectedMonth, selectedYear],
    });
    queryClient.invalidateQueries({ queryKey: ["summary"] });
  };

  // Page header component
  const pageHeader = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20 dark:bg-orange-500/10">
          <CreditCard className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">One-time</h1>
          <p className="text-sm text-muted-foreground">
            Non-recurring expenses
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-1 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous month</span>
          </Button>
          <div className="min-w-32 text-center">
            <span className="text-sm font-medium">
              {getMonthName(selectedMonth)} {selectedYear}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            disabled={isCurrentMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next month</span>
          </Button>
        </div>

        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6">
        {pageHeader}
        <SummaryCardsSkeleton count={3} />
        <TableSkeleton rows={5} columns={5} />
      </div>
    );
  }

  if (!transactions || !summary) {
    return (
      <div className="container mx-auto space-y-6">
        {pageHeader}
        <ErrorState
          title="Failed to load expenses"
          message="We couldn't load your one-time expenses. Please try again."
          onRetry={() => {
            queryClient.invalidateQueries({
              queryKey: ["one-time", selectedMonth, selectedYear],
            });
            queryClient.invalidateQueries({ queryKey: ["summary"] });
          }}
          className="min-h-[40vh]"
        />
      </div>
    );
  }

  // Check if no expenses for selected month
  if (transactions.length === 0) {
    return (
      <div className="container mx-auto space-y-6">
        {pageHeader}
        <EmptyState
          icon={CreditCard}
          title={`No expenses in ${getMonthName(selectedMonth)} ${selectedYear}`}
          description="You haven't recorded any one-time expenses for this month. Add your purchases, bills, or other individual expenses to track your spending."
          actionLabel="Add an expense"
          onAction={handleAdd}
          iconClassName="bg-orange-500/20 dark:bg-orange-500/10"
        />
        <AddEditOneTimeModal
          open={modalOpen}
          onOpenChangeAction={setModalOpen}
          transaction={editingTransaction}
          onSuccessAction={handleSuccess}
          defaultMonth={selectedMonth}
          defaultYear={selectedYear}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      {pageHeader}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 p-4 shadow-sm backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total This Month</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(monthlyTotal)}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/10">
              <CreditCard className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {transactionCount} expense{transactionCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 p-4 shadow-sm backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Average Per Expense
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(
                  transactionCount > 0 ? monthlyTotal / transactionCount : 0,
                )}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10">
              <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">This month</p>
        </div>
        <div className="overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 p-4 shadow-sm backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Top Category</p>
              <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                {topCategory ? topCategory[0] : "—"}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10">
              <Tag className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {topCategory
              ? formatCurrency(Number(topCategory[1].totalAmount))
              : "No expenses"}
          </p>
        </div>
      </div>

      <OneTimeTable transactions={transactions} onEditAction={handleEdit} />

      <AddEditOneTimeModal
        open={modalOpen}
        onOpenChangeAction={setModalOpen}
        transaction={editingTransaction}
        onSuccessAction={handleSuccess}
      />
    </div>
  );
}
