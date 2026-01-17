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
import { DesktopSidebarToggle } from "./smart-toggle";

const clients = [
  { name: "Intel Ltd", id: 1 },
  { name: "RCNL Ltd", id: 2 },
  { name: "Zubair Ltd", id: 3 },
  { name: "Greenwood Ltd", id: 4 },
];

export function AppSidebar() {
  // const { toggleSidebar, state } = useSidebar();

  return (
    <Sidebar collapsible='icon' className='border-r bg-sidebar'>
      {/* Toggle button using Shadcn's toggle */}
      {/* <button
        onClick={toggleSidebar}
        className='h-6 w-6 bg-background border shadow-sm absolute -right-3 top-6 z-50
          hover:bg-background hover:scale-105 transition-transform rounded-md flex items-center justify-center'>
        {state === "expanded" ? (
          <ChevronLeft className='h-4 w-4' />
        ) : (
          <ChevronRight className='h-4 w-4' />
        )}
      </button> */}
      <DesktopSidebarToggle />

      <SidebarContent className='flex-1'>
        <SidebarGroup>
          <SidebarMenu>
            <Collapsible defaultOpen className='group/collapsible'>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip='Company Management'>
                    <Building2 className='h-4 w-4' />
                    <span>Company Management</span>
                    <ChevronDown className='ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180' />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>

              <CollapsibleContent>
                <SidebarMenuSub>
                  {clients.map((client) => (
                    <SidebarMenuSubItem key={client.id}>
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

      <SidebarFooter className='border-t p-3'>
        <SidebarMenuButton
          asChild
          className='w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive'>
          <div className='flex items-center gap-2'>
            <LogOut className='h-4 w-4' />
            <span>Logout Account</span>
          </div>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
