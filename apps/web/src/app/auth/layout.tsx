"use client";

import { verifyAuth } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth-store";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    (async () => {
      // If user is authenticated redirect to dashboard
      const {
        user,
        actions: { setAuth, clearAuth },
      } = useAuthStore.getState();
      if (user) {
        redirect("/dashboard");
      }

      // Attempt to verify user
      const result = await verifyAuth();
      if (result.success) {
        setAuth(result.data.user);
        redirect("/dashboard");
      } else {
        clearAuth();
        setLoading(false);
      }
    })();
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-linear-to-br from-chart-1/20 to-chart-2/20 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-linear-to-tl from-chart-3/20 to-chart-4/20 blur-3xl" />
      </div>

      <nav className="relative z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/favicon.svg"
              alt="Subtrack"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
              Subtrack
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </nav>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </main>

      <footer className="relative z-10 border-t py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Subtrack. Manage your finances with
            ease.
          </p>
        </div>
      </footer>
    </div>
  );
}
