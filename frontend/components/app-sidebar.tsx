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

import { ChevronDown, LogOut, UserRoundCog } from "lucide-react";
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
      {/* Toggle */}
      <DesktopSidebarToggle />

      <SidebarContent className='flex-1 bg-muted '>
        <SidebarGroup>
          <SidebarMenu>
            <Collapsible defaultOpen className='group/collapsible'>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip='Company Management'>
                    <UserRoundCog className='h-8 w-8' />
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

      <SidebarFooter className='bg-muted p-3'>
        <SidebarMenuButton
          asChild
          className='w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive'>
          <div className='flex items-center gap-2 text-[16px]'>
            <LogOut className='h-4 w-4' />
            <span>Logout Account</span>
          </div>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
