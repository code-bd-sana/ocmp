"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { Building2, ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import { SmartToggle } from "./smart-toggle";

const clients = [
  { name: "Intel Ltd", id: 1 },
  { name: "RCNL Ltd", id: 2 },
  { name: "Zubair Ltd", id: 3 },
  { name: "Greenwood Ltd", id: 4 },
];

export function AppSidebar() {
  return (
    <div className='h-full sticky top-0 z-20'>
      <Sidebar collapsible='icon' className='h-screen flex flex-col'>
        <SmartToggle />
        <SidebarContent className='flex-1'>
          <SidebarGroup>
            <SidebarMenu>
              {/* Collapsible client list */}
              <Collapsible defaultOpen className='group/collapsible'>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Building2 className='h-4 w-4' />
                      <span>Company Management</span>
                      <ChevronDown className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180 h-4 w-4' />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {clients.map((client) => (
                      <SidebarMenuSubItem key={client.name}>
                        <SidebarMenuSubButton asChild>
                          <Link href={`/clients/${client.id}`}>
                            {client.name}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className='p-4'>
          <SidebarMenuButton
            asChild
            className='text-destructive hover:bg-destructive/10'>
            <div className='flex items-center gap-2'>
              <LogOut className='h-4 w-4' />
              <span>Logout Account</span>
            </div>
          </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
