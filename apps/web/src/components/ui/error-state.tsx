"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this data. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[60vh] flex-col items-center justify-center gap-4",
        className,
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 dark:bg-red-500/10">
        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <div className="text-center">
        <h3 className="mb-1 text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  );
}

interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function InlineError({ message, onRetry, className }: InlineErrorProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
        <p className="text-sm text-red-800 dark:text-red-200">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="text-red-700 hover:bg-red-100 hover:text-red-800 dark:text-red-300 dark:hover:bg-red-900/40"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
