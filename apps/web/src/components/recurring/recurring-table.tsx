"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  CalendarRange,
  Calendar,
  CalendarClock,
  Pencil,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

type RecurringFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
type RecurringType = "BILL" | "SUBSCRIPTION";

export type RecurringTransaction = {
  id: string;
  name: string;
  amount: number;
  type: RecurringType;
  category: string;
  frequency: RecurringFrequency;
  startDate: string;
  isActive: boolean;
  normalizedAmount: number;
  createdAt: string;
  updatedAt: string;
};

type RecurringTableProps = {
  transactions: RecurringTransaction[];
  onEditAction: (transaction: RecurringTransaction) => void;
  onToggleStatusAction: (id: string, isActive: boolean) => void;
  isToggling: string | null;
};

const frequencyIcons: Record<RecurringFrequency, typeof CalendarDays> = {
  DAILY: CalendarDays,
  WEEKLY: CalendarRange,
  MONTHLY: Calendar,
  YEARLY: CalendarClock,
};

const frequencyLabels: Record<RecurringFrequency, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export function RecurringTable({
  transactions,
  onEditAction,
  onToggleStatusAction,
  isToggling,
}: RecurringTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-muted-foreground mb-2">
          You haven&apos;t added any recurring expenses yet.
        </p>
        <p className="text-muted-foreground text-sm">
          Add your first recurring expense to start tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Monthly</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const FrequencyIcon = frequencyIcons[transaction.frequency];
            const isInactive = !transaction.isActive;

            return (
              <TableRow
                key={transaction.id}
                className={`${isInactive ? "opacity-60" : ""}`}
              >
                <TableCell className="font-medium">
                  {transaction.name}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      transaction.type === "BILL" ? "default" : "secondary"
                    }
                  >
                    {transaction.type === "BILL" ? "Bill" : "Subscription"}
                  </Badge>
                </TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <FrequencyIcon className="text-muted-foreground h-4 w-4" />
                    <span>{frequencyLabels[transaction.frequency]}</span>
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                <TableCell>
                  {formatCurrency(transaction.normalizedAmount)}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={transaction.isActive}
                    onCheckedChange={(checked) =>
                      onToggleStatusAction(transaction.id, checked)
                    }
                    disabled={isToggling === transaction.id}
                    aria-label={`${transaction.isActive ? "Disable" : "Enable"} ${transaction.name}`}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditAction(transaction)}
                    aria-label={`Edit ${transaction.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
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
