"use client";

import { useSidebar } from "../ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";

export default function DashboardFooter() {
  const { state, isMobile } = useSidebar();
  const pathname = usePathname();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  const isExpanded = state === "expanded";
  const sidebarWidth = isMobile ? "0rem" : isExpanded ? "1rem" : "3rem";

  const footerItems = useMemo(
    () => [
      {
        label: "Vehicle List",
        href: "/dashboard/vehicle-list",
      },
      {
        label: "Spot Checks",
        href: "/dashboard/spot-checks",
      },
      {
        label: "Driver details, licence and WTD infringements",
        href: "/dashboard/driver-details",
      },
      {
        label: "Driver tachograph and WTD infringements",
        href: "/dashboard/driver-tachograph",
      },
      {
        label: "Training and Toolbox Talks",
        href: "/dashboard/training",
      },
      {
        label: "Renewals Tracker",
        href: "/dashboard/renewals",
      },
      {
        label: "Traffic Commissioner Communications",
        href: "/dashboard/traffic-commissioner",
      },
      {
        label: "Self service and login",
        href: "/dashboard/self-service",
      },
      {
        label: "OCRS checks and rectification action plans",
        href: "/dashboard/ocrs-checks",
      },
      {
        label: "PG9s PG13 FG Clearance Investigation and TC Reporting",
        href: "/dashboard/pg9s",
      },
      {
        label: "Contact log",
        href: "/dashboard/contact-log",
      },
      {
        label: "GV79 and Maintenance Provider Communication and Meeting Agenda",
        href: "/dashboard/gv79",
      },
      {
        label: "Vehicle",
        href: "/dashboard/gv79",
      },
      {
        label: "Vehicle",
        href: "/dashboard/gv79",
      },
      {
        label: "Vehicle",
        href: "/dashboard/gv79",
      },
      {
        label: "Vehicle",
        href: "/dashboard/gv79",
      },
      {
        label: "Vehicle",
        href: "/dashboard/gv79",
      },
    ],
    []
  );

  // Update maxScroll when container loads or resizes
  useEffect(() => {
    const updateMaxScroll = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        setMaxScroll(container.scrollWidth - container.clientWidth);
      }
    };

    updateMaxScroll();
    window.addEventListener("resize", updateMaxScroll);

    return () => window.removeEventListener("resize", updateMaxScroll);
  }, [footerItems]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = 200;

    if (direction === "left") {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }

    setScrollPosition(container.scrollLeft);
  };

  // Calculate if buttons should be disabled
  const isAtStart = scrollPosition === 0;
  const isAtEnd = scrollPosition >= maxScroll - 1;

  return (
    <footer
      className='bg-muted px-4 py-3 transition-all duration-200 flex'
      style={{ marginLeft: sidebarWidth }}>
      <div className='flex items-center gap-2 w-full'>
        {/* Left arrow  */}
        <button
          onClick={() => scroll("left")}
          className={cn(
            "p-1 rounded-md border bg-white hover:bg-gray-50 transition-all hidden md:block",
            isAtStart && "opacity-30 cursor-not-allowed"
          )}
          disabled={isAtStart}>
          <ChevronLeft className='h-4 w-4' />
        </button>

        {/* Scrollable tabs */}
        <div
          ref={scrollContainerRef}
          className='flex-1 flex gap-x-2 overflow-x-auto md:overflow-x-hidden scrollbar-hide'
          onScroll={(e) => {
            const container = e.currentTarget;
            setScrollPosition(container.scrollLeft);
            setMaxScroll(container.scrollWidth - container.clientWidth);
          }}>
          {footerItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "inline-flex items-center justify-center h-10 px-3 transition-all duration-200 border",
                  "whitespace-nowrap overflow-hidden shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary min-w-max"
                    : "text-primary border-primary bg-(--primary-light) max-w-23 truncate"
                )}
                title={item.label}>
                <span className={cn("text-sm font-medium truncate")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          className={cn(
            "p-1 rounded-md border bg-white hover:bg-gray-50 transition-all hidden md:block",
            isAtEnd && "opacity-30 cursor-not-allowed"
          )}
          disabled={isAtEnd}>
          <ChevronRight className='h-4 w-4' />
        </button>
      </div>
    </footer>
  );
}
