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

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className='w-full border-b bg-muted shadow-sm'>
      <div className='w-full '>
        <div className=' h-20 md:h-24'>
          {/* Scrollable navbar */}
          <div
            className='
              absolute inset-0
              flex items-center justify-between lg:justify-center md:px-20 gap-2 sm:gap-6 lg:gap-24 
              overflow-x-auto pb-3
              snap-x snap-mandatory
              scrollbar-hide
              scroll-smooth z-0
            '>
            {items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex flex-col items-center min-w-24 sm:min-w-21 transition-colors snap-center",
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
                    <span className='absolute -bottom-1 left-1/2 -translate-x-1/2 w-16  sm:w-16 md:w-20 lg:w-24 h-1 bg-primary rounded-full transition-all duration-300' />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
