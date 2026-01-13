"use client";

import { verifyAuth } from "@/lib/api/auth";
import { useAuthStore, useRequiredAuthUser } from "@/store/auth-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function DashLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(true);
  const user = useRequiredAuthUser();
  const queryClient = new QueryClient();

  useEffect(() => {
    (async () => {
      // If user is authenticated skip verification
      const {
        user,
        actions: { setAuth, clearAuth },
      } = useAuthStore.getState();
      if (user) {
        setLoading(false);
        return;
      }

      // Attempt to verify user
      const result = await verifyAuth();
      if (result.success) {
        setAuth(result.data.user);
        setLoading(false);
      } else {
        clearAuth();
        redirect("/auth/login");
      }
    })();
  });

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <AppSidebar
            name={user.name}
            email={user.email}
            avatar={user.picture}
          />
          <SidebarInset className="relative px-4">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 blur-3xl dark:from-emerald-500/5 dark:to-cyan-500/5" />
              <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-gradient-to-tl from-violet-500/10 to-fuchsia-500/10 blur-3xl dark:from-violet-500/5 dark:to-fuchsia-500/5" />
            </div>
            <header className="relative z-10 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
              </div>
            </header>
            <main className="relative z-10 pb-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </QueryClientProvider>
    </>
  );
}
