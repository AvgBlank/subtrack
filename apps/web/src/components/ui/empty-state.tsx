"use client";

import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  iconClassName?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  iconClassName,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 py-16 backdrop-blur-sm",
        className,
      )}
    >
      <div
        className={cn(
          "mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted",
          iconClassName,
        )}
      >
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-6 max-w-md text-center text-sm text-muted-foreground">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
