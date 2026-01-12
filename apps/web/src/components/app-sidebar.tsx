"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  GalleryVerticalEnd,
  Settings2,
  SquareTerminal,
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
    navMain: [
      {
        title: "Playground",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
      },
      {
        title: "Models",
        url: "#",
        icon: Bot,
      },
      {
        title: "Documentation",
        url: "#",
        icon: BookOpen,
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings2,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="borer-sidebar-border pb-3 border-b">
        <NavOrg org={data.org} />
      </SidebarHeader>
      <SidebarContent className="pt-3 borer-sidebar-border pb-3 border-b">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="pt-3">
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
