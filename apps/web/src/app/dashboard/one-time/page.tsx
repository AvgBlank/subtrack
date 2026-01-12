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
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">One-time</h1>
          <p className="text-muted-foreground text-sm">
            Non-recurring expenses
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous month</span>
            </Button>
            <div className="min-w-32 text-center">
              <span className="font-medium">
                {getMonthName(selectedMonth)} {selectedYear}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              disabled={isCurrentMonth}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next month</span>
            </Button>
          </div>

          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add expense
          </Button>
        </div>
      </div>

      {/* Summary Tiles */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-muted-foreground text-sm">Total This Month</p>
          <p className="text-2xl font-bold">{formatCurrency(monthlyTotal)}</p>
          <p className="text-muted-foreground text-xs">
            {transactionCount} expense{transactionCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-muted-foreground text-sm">Average Per Expense</p>
          <p className="text-2xl font-bold">
            {formatCurrency(
              transactionCount > 0 ? monthlyTotal / transactionCount : 0,
            )}
          </p>
          <p className="text-muted-foreground text-xs">This month</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-muted-foreground text-sm">Top Category</p>
          <p className="text-2xl font-bold">
            {topCategory ? topCategory[0] : "—"}
          </p>
          <p className="text-muted-foreground text-xs">
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
