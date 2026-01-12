"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

export type Income = {
  id: string;
  source: string;
  amount: number;
  date: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type IncomeTableProps = {
  incomes: Income[];
  onEditAction: (income: Income) => void;
  onToggleStatusAction: (id: string, isActive: boolean) => void;
  isToggling: string | null;
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
};

export function IncomeTable({
  incomes,
  onEditAction,
  onToggleStatusAction,
  isToggling,
}: IncomeTableProps) {
  if (incomes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-muted-foreground mb-2">
          You haven&apos;t added any income yet.
        </p>
        <p className="text-muted-foreground text-sm">
          Add your first income to start tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Source</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date Credited</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incomes.map((income) => {
            const isInactive = !income.isActive;

            return (
              <TableRow
                key={income.id}
                className={isInactive ? "opacity-50" : ""}
              >
                <TableCell className="font-medium">{income.source}</TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(income.amount)}
                </TableCell>
                <TableCell>{formatDate(income.date)}</TableCell>
                <TableCell>
                  <Switch
                    checked={income.isActive}
                    onCheckedChange={(checked) =>
                      onToggleStatusAction(income.id, checked)
                    }
                    disabled={isToggling === income.id}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditAction(income)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
