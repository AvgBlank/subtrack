"use client";

import * as React from "react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import Image from "next/image";

export function NavOrg({
  org,
}: {
  org: {
    name: string;
  };
}) {
  if (!org) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => {
            redirect("/");
          }}
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-gradient-to-br hover:from-slate-500/10 hover:to-slate-600/10"
        >
          <Image
            src="/favicon.svg"
            alt="Subtrack"
            width={32}
            height={32}
            className="size-8"
          />
          <div className="grid flex-1 text-left text-xl leading-tight">
            <span className="truncate font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
              {org.name}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
