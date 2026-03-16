"use client";

import { cn } from "@/lib/utils";
import { AuthAction } from "@/service/auth";
import {
  Calendar,
  FolderOpen,
  LayoutDashboard,
  Settings,
  Truck,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// সব navigation items
const items = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Repository", href: "/dashboard/repository-settings", icon: FolderOpen },
  { name: "Vehicles", href: "/dashboard/vehicles", icon: Truck },
  { name: "All Users", href: "/dashboard/users", icon: Users }, 
  { name: "All Transport Manager", href: "/dashboard/transport-managers", icon: UserCog }, // 
  { name: "Planner", href: "/dashboard/planner", icon: Calendar },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      try {
        const userRole = await AuthAction.myRole();
        setUserRole(userRole || null);
      } catch (error) {
        console.error("Failed to fetch user role:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserRole();
  }, []);


  const filteredItems = items.filter(item => {

    if (item.name === "All Users") {
      return userRole === "ADMIN";
    }
   
    if (item.name === "All Transport Manager") {
      return userRole === "STANDALONE_USER";
    }
 
    return true;
  });

  if (isLoading) {
    return (
      <nav className='w-full border-b bg-muted shadow-sm'>
        <div className='h-20 md:h-26 flex items-center justify-center'>
          <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className='w-full border-b bg-muted shadow-sm'>
      <div className='h-20 md:h-26 overflow-x-auto scrollbar-hide scroll-smooth'>
        <div className='flex items-center justify-start lg:justify-center h-full min-w-max px-6 md:px-10 gap-2 sm:gap-6 lg:gap-20'>
          {filteredItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex flex-col items-center min-w-24 sm:min-w-21 transition-colors snap-center shrink-0",
                  isActive
                    ? "text-primary"
                    : "text-(--dashboard-navbar) hover:text-primary",
                )}>
                <item.icon
                  className='h-7 w-8 sm:h-7 sm:w-9 md:h-10 md:w-10 mb-1 md:mb-1.5 transition-transform group-hover:scale-110'
                  strokeWidth={1.5}
                />
                <span className='text-[11px] sm:text-base md:text-sm font-bold whitespace-nowrap md:mb-2'>
                  {item.name}
                </span>

                {isActive && (
                  <span className='absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 sm:w-16 md:w-20 lg:w-24 h-1 bg-primary rounded-full transition-all duration-300' />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}