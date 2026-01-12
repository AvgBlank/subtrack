"use client";

import * as React from "react";
import {
  ChartColumn,
  GalleryVerticalEnd,
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
      logo: GalleryVerticalEnd,
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
    <Sidebar collapsible="icon">
      <SidebarHeader className="borer-sidebar-border pb-3 border-b">
        <NavOrg org={data.org} />
      </SidebarHeader>
      <SidebarContent className="pt-3 borer-sidebar-border pb-3 border-b">
        <NavMain main={data.navMain} items={data.navItems} />
      </SidebarContent>
      <SidebarFooter className="pt-3">
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
