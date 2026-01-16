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
  { name: "Repository", href: "/dashboard/repository", icon: FolderOpen },
  { name: "Vehicles", href: "/dashboard/vehicles", icon: Truck },
  { name: "All Users", href: "/dashboard/users", icon: Users },
  { name: "Planner", href: "/dashboard/planner", icon: Calendar },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className='w-full border-b bg-background shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='relative h-20 md:h-24'>
          {/* Scrollable container */}
          <div
            className='
              absolute inset-0
              flex items-end gap-6 sm:gap-8 lg:gap-10
              overflow-x-auto pb-3
              snap-x snap-mandatory
              scrollbar-hide
              scroll-smooth
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
                    "group relative flex flex-col items-center min-w-18 sm:min-w-21 transition-colors snap-center",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary"
                  )}>
                  <item.icon
                    className='h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 mb-1 md:mb-1.5 transition-transform group-hover:scale-110'
                    strokeWidth={1.7}
                  />
                  <span className='text-[11px] sm:text-xs md:text-sm font-bold whitespace-nowrap'>
                    {item.name}
                  </span>

                  {isActive && (
                    <span className='absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 sm:w-10 h-0.5 bg-primary rounded-full transition-all duration-300' />
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
