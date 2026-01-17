"use client";

import { useSidebar } from "../ui/sidebar";
import DashboardFooter from "./dashboard-footer";
import { DashboardNav } from "./dashboard-nav";

export default function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state, isMobile } = useSidebar();

  const isExpanded = state === "expanded";

  const sidebarWidth = isMobile ? "0rem" : isExpanded ? "16rem" : "3rem";

  return (
    <>
      {/* Dashboard Nav */}
      <div
        className='fixed top-14 md:top-16 z-1 bg-muted border-b shadow-sm right-0 transition-all duration-200'
        style={{ left: sidebarWidth }}>
        <DashboardNav />
      </div>

      {/* Main Content */}
      <div className='flex-1 mt-4 mb-12 pt-14 md:pt-16 overflow-y-auto'>
        <div className='p-4 md:p-6 lg:px-8 lg:py-10'>{children}</div>
      </div>
      <div
        className='fixed bottom-0 z-1 bg-muted border-t shadow-sm right-0 transition-all duration-200 '
        style={{ left: sidebarWidth }}>
        <DashboardFooter />
      </div>
    </>
  );
}
