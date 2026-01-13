"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkCanISpend } from "@/lib/api/summary";
import { ShoppingCart, Check, X, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

export function CanISpend() {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    canSpend: boolean;
    remainingAfterSpend: number;
  } | null>(null);

  const handleCheck = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setIsLoading(true);
    try {
      const data = await checkCanISpend(numAmount);
      setResult(data);
    } catch {
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCheck();
    }
  };

  const resetResult = () => {
    setResult(null);
    setAmount("");
  };

  return (
    <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 shadow-sm backdrop-blur-sm dark:from-slate-500/5 dark:to-slate-600/5">
      <CardHeader className="pt-2 [.border-b]:pb-1.25 border-b border-border/50 bg-white/50 dark:bg-black/20">
        <div className="flex items-center gap-2">
          <ShoppingCart className="text-muted-foreground h-5 w-5" />
          <CardTitle>Can I spend this?</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2">
                ₹
              </span>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setResult(null);
                }}
                onKeyDown={handleKeyDown}
                className="pl-7"
                min="0"
                step="0.01"
              />
            </div>
            <Button onClick={handleCheck} disabled={isLoading || !amount}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Check"
              )}
            </Button>
          </div>

          {result !== null && (
            <div
              className={`
                flex items-center gap-3 rounded-lg p-4
                ${
                  result.canSpend
                    ? "bg-green-50 dark:bg-green-950/30"
                    : "bg-red-50 dark:bg-red-950/30"
                }
              `}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  result.canSpend
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-red-100 dark:bg-red-900"
                }`}
              >
                {result.canSpend ? (
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`
                    font-semibold
                    ${
                      result.canSpend
                        ? "text-green-700 dark:text-green-300"
                        : "text-red-700 dark:text-red-300"
                    }
                  `}
                >
                  {result.canSpend ? "Yes, you can!" : "Not right now"}
                </p>
                <p className="text-muted-foreground text-sm">
                  {result.canSpend
                    ? `You'll have ${formatCurrency(result.remainingAfterSpend)} remaining`
                    : `You'd be ${formatCurrency(Math.abs(result.remainingAfterSpend))} over budget`}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={resetResult}>
                Clear
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
