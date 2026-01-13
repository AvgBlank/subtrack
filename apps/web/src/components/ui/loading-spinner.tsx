"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "animate-spin fill-foreground",
        sizeClasses[size],
        className,
      )}
      viewBox="0 0 256 256"
      aria-label="Loading"
      role="status"
    >
      <path d="M236,128a108,108,0,0,1-216,0c0-42.52,24.73-81.34,63-98.9A12,12,0,1,1,93,50.91C63.24,64.57,44,94.83,44,128a84,84,0,0,0,168,0c0-33.17-19.24-63.43-49-77.09A12,12,0,1,1,173,29.1C211.27,46.66,236,85.48,236,128Z" />
    </svg>
  );
}

interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message }: PageLoadingProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <LoadingSpinner size="lg" />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
