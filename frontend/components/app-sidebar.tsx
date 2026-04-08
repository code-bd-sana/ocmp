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
  useSidebar,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { usePathname, useRouter } from "next/navigation";

import {
  Building2,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  LogOut,
  UserCog,
  UserRoundCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import { DesktopSidebarToggle } from "./smart-toggle";
import { AuthAction } from "@/service/auth";
import { ClientAction } from "@/service/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SidebarClient {
  id: string;
  name: string;
}

interface SuperAdminNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SUPER_ADMIN_NAV_ITEMS: SuperAdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "All Users", href: "/admin/all-users", icon: Users },
  {
    label: "Transport Manager",
    href: "/admin/transport-manager",
    icon: UserCog,
  },
  { label: "All Clients", href: "/admin/all-clients", icon: Building2 },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
];

/**
 * Modules that use /dashboard/[slug]/[standAloneId] pattern.
 * Add new modules here as they are built.
 */
const CLIENT_MODULES: { slug: string; label: string }[] = [
  { slug: "driver-details", label: "Driver Details" },
  { slug: "vehicle-list", label: "Vehicle List" },
  { slug: "spot-checks", label: "Spot Checks" },
  { slug: "driver-tachograph", label: "Driver Tachograph" },
  { slug: "training-toolbox", label: "Training Toolbox" },
  { slug: "training-records", label: "Training Records" },
  { slug: "renewal-tracker", label: "Renewal Tracker" },
  { slug: "ocrs-plan", label: "OCRS Plan" },
  { slug: "traffic-commissioner", label: "Traffic Commissioner" },
  { slug: "self-service", label: "Self Service" },
  { slug: "planner", label: "Planner" },
  { slug: "pg9AndPg13Plan", label: "PG9 and PG13 Plan" },
  { slug: "maintenance-meeting", label: "Maintenance & Meeting" },
  { slug: "contact-log", label: "Contact Log" },
  {
    slug: "audits-rectification-reports",
    label: "Audits & Rectification Reports",
  },
  { slug: "compliance-timetable", label: "Compliance Timetable" },
  { slug: "transport-manager", label: "Transport Manager" },
  { slug: "fuel-usage", label: "Fuel Usage" },
  { slug: "wheel-retorque", label: "Wheel Re-torque Policy" },
  { slug: "working-time-directive", label: "Working Time Directive" },
  { slug: "policy-review-tracker", label: "Policy Review Tracker" },
  { slug: "subcontractor-details", label: "Subcontractor Details" },
];

export function AppSidebar({
  mode = "default",
}: {
  mode?: "default" | "super-admin";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const [clients, setClients] = useState<SidebarClient[]>([]);
  const isSuperAdminMode = mode === "super-admin";

  const handleLogout = async () => {
    try {
      await AuthAction.LogOut();
      toast.success("Logged out successfully");
    } catch {
      AuthAction.RemoveAuthToken();
      toast.success("Logged out successfully");
    } finally {
      router.replace("/signin");
    }
  };

  useEffect(() => {
    if (isSuperAdminMode) {
      return;
    }

    ClientAction.getClients({ showPerPage: 10, pageNo: 1 })
      .then((res) => {
        if (res.status && res.data?.data) {
          const approvedClients = res.data.data.filter(
            (row) => (row.status || "").toUpperCase() === "APPROVED",
          );

          setClients(
            approvedClients.map((row) => ({
              id: row.client._id,
              name: row.client.fullName,
            })),
          );
        }
      })
      .catch(() => {});
  }, [isSuperAdminMode]);

  const segments = pathname.split("/");
  const moduleSlug = segments[2] || "";
  const activeModule = CLIENT_MODULES.find((m) => m.slug === moduleSlug);
  const activeClientId = activeModule ? (segments[3] ?? "") : "";

  const getClientInitial = (name: string) =>
    name.trim().charAt(0).toUpperCase();

  const isSuperAdminItemActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Sidebar collapsible="icon" className="bg-sidebar border-r">
      <DesktopSidebarToggle />

      <SidebarContent className="bg-muted flex-1">
        {isSuperAdminMode ? (
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Super Admin"
                  className="bg-primary hover:bg-primary/90 h-14 rounded-none px-4 font-medium text-white hover:text-white"
                >
                  <UserRoundCog className="h-5 w-5" />
                  <span className="text-[16px]">Super Admin</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <div className="mt-3 space-y-1 px-2">
                {SUPER_ADMIN_NAV_ITEMS.map((item) => {
                  const isActive = isSuperAdminItemActive(item.href);

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.label}
                        isActive={isActive}
                        className={`hover:text-primary h-11 transition-all ${
                          isActive
                            ? "bg-primary/10 text-primary border-primary/30 border font-semibold"
                            : "text-(--body-text)"
                        }`}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </div>
            </SidebarMenu>
          </SidebarGroup>
        ) : (
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem className="px-2 pt-2">
                <SidebarMenuButton
                  asChild
                  tooltip="Subscriptions"
                  isActive={
                    pathname === "/dashboard/subscriptions" ||
                    pathname.startsWith("/dashboard/subscriptions/")
                  }
                  className="hover:text-primary h-11 text-(--body-text)"
                >
                  <Link href="/dashboard/subscriptions">
                    <CreditCard className="h-4 w-4" />
                    <span>Subscriptions</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={activeModule?.label || "Company Management"}
                      className="bg-primary hover:bg-primary/90 h-14 rounded-none px-4 font-medium text-white hover:text-white"
                    >
                      <UserRoundCog className="h-5 w-5" />
                      <span className="text-[16px]">
                        {activeModule?.label || "Company Management"}
                      </span>
                      <ChevronDown className="ml-auto h-5 w-5 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>

                <CollapsibleContent>
                  {activeModule ? (
                    state === "collapsed" ? (
                      <div className="mt-3 flex flex-col gap-2">
                        {clients.map((client) => {
                          const initial = getClientInitial(client.name);

                          return (
                            <Link
                              key={client.id}
                              href={`/dashboard/${activeModule.slug}/${client.id}`}
                              title={client.name}
                              aria-label={client.name}
                              className={`flex h-9 w-9 items-center justify-center rounded-md text-sm font-semibold transition-colors ${
                                activeClientId === client.id
                                  ? "text-primary bg-white shadow-sm"
                                  : "bg-sidebar-accent/60 hover:bg-sidebar-accent hover:text-primary text-(--body-text)"
                              }`}
                            >
                              {initial}
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <SidebarMenuSub className="mt-3 -ml-5">
                        {clients.map((client, index) => (
                          <SidebarMenuSubItem
                            key={client.id}
                            className="relative"
                          >
                            {index < clients.length - 1 && (
                              <div className="bg-muted-foreground absolute -top-1 bottom-0 left-6 w-0.5" />
                            )}

                            <div className="bg-muted-foreground absolute top-1/2 left-6 h-0.5 w-5" />

                            {index === clients.length - 1 && (
                              <div className="bg-muted-foreground absolute -top-1 left-6 h-7 w-0.5" />
                            )}
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeClientId === client.id}
                              className={`hover:text-primary py-6 pl-14 font-normal text-(--body-text) hover:text-base ${
                                activeClientId === client.id
                                  ? "!bg-white! !text-primary! data-[active=true]:text-primary! ml-12 rounded-none pl-3 shadow-sm! data-[active=true]:bg-white!"
                                  : ""
                              } `}
                            >
                              <Link
                                href={`/dashboard/${activeModule.slug}/${client.id}`}
                                className="block"
                              >
                                {client.name}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )
                  ) : state === "collapsed" ? null : (
                    <div className="text-muted-foreground px-6 py-4 text-sm">
                      Please select a module from the footer to view clients.
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="bg-muted p-3">
        <SidebarMenuButton
          onClick={handleLogout}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full cursor-pointer justify-start"
        >
          <div className="flex items-center gap-2 text-[16px]">
            <LogOut className="h-4 w-4" />
            <span>Logout Account</span>
          </div>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
