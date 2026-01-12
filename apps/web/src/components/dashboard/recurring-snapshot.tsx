"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Receipt, Tv } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

type RecurringItem = {
  id: string;
  name: string;
  normalizedAmount: number;
};

type RecurringSnapshotProps = {
  bills: {
    total: number;
    count: number;
    items: RecurringItem[];
  };
  subscriptions: {
    total: number;
    count: number;
    items: RecurringItem[];
  };
};

function RecurringColumn({
  title,
  icon: Icon,
  total,
  count,
  items,
}: {
  title: string;
  icon: React.ElementType;
  total: number;
  count: number;
  items: RecurringItem[];
}) {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="text-muted-foreground h-5 w-5" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div>
        <p className="text-2xl font-bold">{formatCurrency(total)}</p>
        <p className="text-muted-foreground text-sm">
          {count} {title.toLowerCase()}
        </p>
      </div>
      <div className="space-y-2">
        {items.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-sm"
          >
            <span className="truncate">{item.name}</span>
            <span className="text-muted-foreground ml-2">
              {formatCurrency(item.normalizedAmount)}
            </span>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-muted-foreground text-sm">
            No {title.toLowerCase()} yet
          </p>
        )}
      </div>
    </div>
  );
}

export function RecurringSnapshot({
  bills,
  subscriptions,
}: RecurringSnapshotProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recurring Expenses</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/recurring">View all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
          <RecurringColumn
            title="Bills"
            icon={Receipt}
            total={bills.total}
            count={bills.count}
            items={bills.items}
          />
          <div className="bg-border hidden w-px sm:block" />
          <div className="bg-border h-px sm:hidden" />
          <RecurringColumn
            title="Subscriptions"
            icon={Tv}
            total={subscriptions.total}
            count={subscriptions.count}
            items={subscriptions.items}
          />
        </div>
      </CardContent>
    </Card>
  );
}
