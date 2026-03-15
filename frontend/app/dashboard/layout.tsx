"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/dashboard/header";
import DashboardContent from "@/components/dashboard/dashboard-content";
import { useRouteGuard } from "@/hooks/useRouteGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isChecking, canRender } = useRouteGuard({
    mode: "protected",
    redirectTo: "/signin",
  });

  if (isChecking || !canRender) {
    return null;
  }

  return (
    <>
      <SidebarProvider>
        <div className='flex min-h-screen w-full flex-col'>
          {/* Header */}
          <div className='sticky top-0 z-50 '>
            <Header />
          </div>

          {/* Main area */}
          <div className='flex flex-1 relative'>
            <AppSidebar />
            <DashboardContent>{children}</DashboardContent>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
