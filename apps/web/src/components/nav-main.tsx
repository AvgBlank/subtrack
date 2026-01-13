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
      <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
        Platform
      </SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            tooltip={main.title}
            className="hover:bg-gradient-to-br hover:from-slate-500/10 hover:to-slate-600/10"
          >
            <Link href={main.url}>
              <div className="flex h-6 w-6 items-center justify-center rounded-sm ">
                {main.icon && (
                  <main.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                )}
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
                <SidebarMenuButton
                  tooltip={item.title}
                  className="hover:bg-gradient-to-br hover:from-slate-500/10 hover:to-slate-600/10"
                >
                  <div
                    className={"flex h-6 w-6 items-center justify-center rounded-md"}
                  >
                    {item.icon && (
                      <item.icon
                        className={`h-4 w-4 ${
                          index === 0
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-violet-600 dark:text-violet-400"
                        }`}
                      />
                    )}
                  </div>
                  <span className="text-base font-medium">{item.title}</span>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground/50 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        asChild
                        className="hover:bg-gradient-to-br hover:from-slate-500/10 hover:to-slate-600/10"
                      >
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
