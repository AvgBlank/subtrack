"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      variant: "neutral",
    },
    {
      title: "Recurring",
      value: recurring,
      icon: Repeat,
      variant: "neutral",
    },
    {
      title: "One-time",
      value: oneTime,
      icon: CreditCard,
      variant: "neutral",
    },
    {
      title: "Remaining",
      value: remaining,
      icon: Wallet,
      variant: remaining >= 0 ? "positive" : "negative",
      showTooltip: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="py-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-1">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              {card.showTooltip && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="font-medium mb-1">How is this calculated?</p>
                    <p className="text-xs">
                      {formatCurrency(income)} - {formatCurrency(totalExpenses)}{" "}
                      - {formatCurrency(totalSavings)} ={" "}
                      {formatCurrency(remaining)}
                    </p>
                    <p className="text-xs mt-1">
                      Income - Expenses - Savings = Remaining
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            <card.icon className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${card.variant === "positive" && "text-green-600 dark:text-green-400"} ${card.variant === "negative" && "text-red-600 dark:text-red-400"}`}
            >
              {formatCurrency(card.value)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
