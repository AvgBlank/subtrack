"use client";

import * as React from "react";
import {
  ChartColumn,
  LayoutDashboard,
  SquareKanban,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { NavOrg } from "@/components/nav-org";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar({
  name,
  email,
  avatar,
}: {
  name: string;
  email: string;
  avatar: string | null;
}) {
  const data = {
    user: {
      name,
      email,
      avatar,
    },
    org: {
      name: "Subtrack",
    },
    navMain: {
      title: "Overview",
      url: "/dashboard",
      icon: SquareKanban,
    },
    navItems: [
      {
        title: "Manage",
        url: "#",
        icon: LayoutDashboard,
        items: [
          { title: "Recurring", url: "/dashboard/recurring" },
          { title: "One Time", url: "/dashboard/one-time" },
          { title: "Income", url: "/dashboard/income" },
          { title: "Savings", url: "/dashboard/savings" },
        ],
      },
      {
        title: "Insights",
        url: "#",
        icon: ChartColumn,
        items: [
          { title: "Analytics", url: "/dashboard/analytics" },
          { title: "Exports", url: "/dashboard/exports" },
        ],
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="border-sidebar-border border-b border-border/50 bg-gradient-to-br from-slate-500/5 to-slate-600/5 pb-3 dark:from-slate-500/5 dark:to-slate-600/5">
        <NavOrg org={data.org} />
      </SidebarHeader>
      <SidebarContent className="border-sidebar-border border-b border-border/50 bg-gradient-to-b from-transparent to-slate-500/5 pt-3 pb-3 dark:to-slate-500/5">
        <NavMain main={data.navMain} items={data.navItems} />
      </SidebarContent>
      <SidebarFooter className="bg-gradient-to-br from-slate-500/5 to-slate-600/5 pt-3 dark:from-slate-500/5 dark:to-slate-600/5">
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
