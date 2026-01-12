"use client";

import { verifyAuth } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth-store";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Receipt, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="animate-spin fill-foreground"
          width="32"
          height="32"
          viewBox="0 0 256 256"
        >
          <path d="M236,128a108,108,0,0,1-216,0c0-42.52,24.73-81.34,63-98.9A12,12,0,1,1,93,50.91C63.24,64.57,44,94.83,44,128a84,84,0,0,0,168,0c0-33.17-19.24-63.43-49-77.09A12,12,0,1,1,173,29.1C211.27,46.66,236,85.48,236,128Z"></path>
        </svg>
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Receipt className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Subtrack</span>
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
