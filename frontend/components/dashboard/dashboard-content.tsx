"use client";

import { useSidebar } from "../ui/sidebar";
import DashboardFooter from "./dashboard-footer";
import { DashboardNav } from "./dashboard-nav";

export default function DashboardContent({
  children,
  userRole,
}: {
  children: React.ReactNode;
  userRole?: string | null;
}) {
  const { state, isMobile } = useSidebar();

  const isExpanded = state === "expanded";

  // Full width if standalone user, otherwise adjust for sidebar
  const sidebarWidth =
    userRole === "STANDALONE_USER"
      ? "0rem"
      : isMobile
        ? "0rem"
        : isExpanded
          ? "16rem"
          : "3rem";

  return (
    <>
      {/* Dashboard Nav */}
      <div
        className="bg-muted fixed top-14 right-0 z-1 border-b shadow-sm transition-all duration-200 md:top-16"
        style={{ left: sidebarWidth }}
      >
        <DashboardNav userRole={userRole} />
      </div>

      {/* Main Content */}
      <div className="mt-4 mb-12 flex-1 overflow-y-auto pt-14 md:pt-16">
        <div className="p-4 md:p-6 lg:px-8 lg:py-10">{children}</div>
      </div>
      <div
        className="bg-muted fixed right-0 bottom-0 z-1 border-t shadow-sm transition-all duration-200"
        style={{ left: sidebarWidth }}
      >
        <DashboardFooter />
      </div>
    </>
  );
}
