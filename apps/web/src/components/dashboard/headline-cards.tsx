"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  Repeat,
  CreditCard,
  Wallet,
  HelpCircle,
  IndianRupee,
} from "lucide-react";

type HeadlineCardsProps = {
  income: number;
  recurring: number;
  oneTime: number;
  remaining: number;
  totalSavings: number;
};

export function HeadlineCards({
  income,
  recurring,
  oneTime,
  remaining,
  totalSavings,
}: HeadlineCardsProps) {
  const totalExpenses = recurring + oneTime;

  const cards = [
    {
      title: "Income",
      value: income,
      icon: IndianRupee,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      valueColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Recurring",
      value: recurring,
      icon: Repeat,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      valueColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "One-time",
      value: oneTime,
      icon: CreditCard,
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-600 dark:text-orange-400",
      valueColor: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Remaining",
      value: remaining,
      icon: Wallet,
      iconBg: remaining >= 0 ? "bg-violet-500/10" : "bg-red-500/10",
      iconColor: remaining >= 0 
        ? "text-violet-600 dark:text-violet-400"
        : "text-red-600 dark:text-red-400",
      valueColor: remaining >= 0 
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-red-600 dark:text-red-400",
      showTooltip: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="overflow-hidden border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 shadow-sm backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className={`text-2xl font-bold ${card.valueColor}`}>
                  {formatCurrency(card.value)}
                </p>
              </div>
              <div className={`flex h-9 w-9 items-center justify-center rounded-full ${card.iconBg}`}>
                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </div>
            {card.showTooltip && (
              <div className="mt-2 flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="mb-1 font-medium">How is this calculated?</p>
                    <p className="text-xs">
                      {formatCurrency(income)} - {formatCurrency(totalExpenses)}{" "}
                      - {formatCurrency(totalSavings)} ={" "}
                      {formatCurrency(remaining)}
                    </p>
                    <p className="mt-1 text-xs">
                      Income - Expenses - Savings = Remaining
                    </p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-xs text-muted-foreground">After savings</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
