"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function NavMain({
  main,
  items,
}: {
  main: {
    title: string;
    url: string;
    icon: LucideIcon;
  };
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Platform</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip={main.title} className="hover:bg-gradient-to-br hover:from-slate-500/10 hover:to-slate-600/10">
            <Link href={main.url}>
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-500/15 to-indigo-500/15 dark:from-blue-500/25 dark:to-indigo-500/25">
                {main.icon && <main.icon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
              </div>
              <span className="text-base font-medium">{main.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {items.map((item, index) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title} className="hover:bg-gradient-to-br hover:from-slate-500/10 hover:to-slate-600/10">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br ${
                    index === 0 
                      ? "from-orange-500/15 to-amber-500/15 dark:from-orange-500/25 dark:to-amber-500/25" 
                      : "from-violet-500/15 to-purple-500/15 dark:from-violet-500/25 dark:to-purple-500/25"
                  }`}>
                    {item.icon && <item.icon className={`h-3.5 w-3.5 ${
                      index === 0 
                        ? "text-orange-600 dark:text-orange-400" 
                        : "text-violet-600 dark:text-violet-400"
                    }`} />}
                  </div>
                  <span className="text-base font-medium">{item.title}</span>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground/50 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild className="hover:bg-gradient-to-br hover:from-slate-500/10 hover:to-slate-600/10">
                        <Link href={subItem.url}>
                          <span className="text-sm">{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
