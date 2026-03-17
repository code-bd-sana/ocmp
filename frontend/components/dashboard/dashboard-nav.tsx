"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderOpen,
  Truck,
  Users,
  Calendar,
  Settings,
} from "lucide-react";

/**
 * Array of navigation items for the dashboard sidebar/header
 *
 * Each item represents a navigation link in the dashboard navigation bar.
 * The items are displayed as clickable icons with labels that provide
 * access to different sections of the dashboard.
 *
 * @type {Array<{
 *   name: string;        // Display name shown to the user
 *   href: string;        // URL path for navigation (Next.js route)
 *   icon: LucideIcon;    // Icon component from lucide-react library
 * }>}
 *
 * @property {string} name - The display name shown to the user (e.g., "Dashboard", "Repository")
 * @property {string} href - The URL path for Next.js navigation. Should follow the app router structure.
 * @property {LucideIcon} icon - Icon component from lucide-react library that visually represents the navigation item.
 */

const items = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    name: "Repository",
    href: "/dashboard/repository-settings",
    icon: FolderOpen,
  },
  { name: "Vehicles", href: "/dashboard/vehicles", icon: Truck },
  { name: "All Users", href: "/dashboard/users", icon: Users },
  { name: "Planner", href: "/dashboard/planner", icon: Calendar },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface DashboardNavProps {
  userRole?: string | null;
}

export function DashboardNav({ userRole }: DashboardNavProps) {
  const pathname = usePathname();
  const filteredItems =
    userRole === "STANDALONE_USER"
      ? items.filter((item) => item.name !== "All Users")
      : items;
  const navItems = filteredItems;

  return (
    <nav className="bg-muted w-full border-b shadow-sm">
      {/* overflow-x-auto on a non-absolute container so left-side items are always reachable */}
      <div className="scrollbar-hide h-20 overflow-x-auto scroll-smooth md:h-26">
        <div className="flex h-full min-w-max items-center justify-start gap-2 px-6 sm:gap-6 md:px-10 lg:justify-center lg:gap-20">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex min-w-24 shrink-0 snap-center flex-col items-center transition-colors sm:min-w-21",
                  isActive
                    ? "text-primary"
                    : "hover:text-primary text-(--dashboard-navbar)",
                )}
              >
                <item.icon
                  className="mb-1 h-7 w-8 transition-transform group-hover:scale-110 sm:h-7 sm:w-9 md:mb-1.5 md:h-10 md:w-10"
                  strokeWidth={1.5}
                />
                <span className="text-[11px] font-bold whitespace-nowrap sm:text-base md:mb-2 md:text-sm">
                  {item.name}
                </span>

                {isActive && (
                  <span className="bg-primary absolute -bottom-1 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full transition-all duration-300 sm:w-16 md:w-20 lg:w-24" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
